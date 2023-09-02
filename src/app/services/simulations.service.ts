import { Injectable } from '@angular/core';
import { SimulationModel } from '../models/simulation.model';
import { TeamMemberService } from './team-member.service';
import { TeamMemberUtil } from '../utils/team-member.util';
import { TeamMemberModel } from '../models/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class SimulationsService {

  constructor(private teamMemberService: TeamMemberService) { }

  private storageKey = 'simulations';

  addSimulation(simulation: SimulationModel) {
    let simulations = this.getSimulations();
    this.addOrUpdateSimulation(simulation, simulations);
  }

  getSimulations() {
    const simulations = localStorage.getItem(this.storageKey);
    return simulations ? JSON.parse(simulations) as SimulationModel[] : [];
  }

  deleteSimulation(id: string) {
    const simulations = this.getSimulations();
    const index = simulations.findIndex(x => x.id === id);
    if (index >= 0) {
      simulations.splice(index, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(simulations));
      localStorage.removeItem(`simulation-${id}`);
    }
  }

  updateSimulationDetails(id: string) {
    let simulations = this.getSimulations();
    let simulation = simulations.find(x => x.id === id);
    if (!simulation) return;

    this.addOrUpdateSimulation(simulation, simulations, false);
  }

  private addOrUpdateSimulation(simulation: SimulationModel, simulations: SimulationModel[], isAddAction = true) {
    let teamMembers: TeamMemberModel[] = [];
    if (isAddAction) {
      this.teamMemberService.setStorageKey('teamMembers');
      teamMembers = this.teamMemberService.getTeamMembers();
      localStorage.setItem(`simulation-${simulation.id}`, JSON.stringify(teamMembers));
    } else {
      this.teamMemberService.setStorageKey(`simulation-${simulation.id}`);
      teamMembers = this.teamMemberService.getTeamMembers();
    }

    let tree = TeamMemberUtil.listToTree(teamMembers);
    if (tree.length == 0) return;

    TeamMemberUtil.calculateFields(tree);
    simulation.title = tree[0].data.title;
    simulation.grupalVolume = tree[0].data.gv;
    simulation.sidePoints = tree[0].data.sp;
    if (!isAddAction) simulation.lastUpdateDate = new Date();

    let monthlyBonusModel = TeamMemberUtil.calculateMonthlyBonus(tree[0]);
    let totalLeadershipBonus = monthlyBonusModel.leadershipBonusArr.reduce((a, b) => a + b, 0);
    simulation.personalBonus = monthlyBonusModel.personalBonus;
    simulation.grupalBonus = monthlyBonusModel.grupalBonus;
    simulation.carBonus = monthlyBonusModel.carBonus;
    simulation.leadershipBonusArr = monthlyBonusModel.leadershipBonusArr;
    simulation.totalBonus = monthlyBonusModel.personalBonus + monthlyBonusModel.grupalBonus + monthlyBonusModel.carBonus + totalLeadershipBonus;

    if (isAddAction) simulations.push(simulation);
    localStorage.setItem(this.storageKey, JSON.stringify(simulations));
  }
}

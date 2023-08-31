import { Injectable } from '@angular/core';
import { SimulationModel } from '../models/simulation.model';
import { TeamMemberService } from './team-member.service';
import { TeamMemberUtil } from '../utils/team-member.util';

@Injectable({
  providedIn: 'root'
})
export class SimulationsService {

  constructor(private teamMemberService: TeamMemberService) { }

  private storageKey = 'simulations';

  addSimulation(simulation: SimulationModel) {
    let simulations = this.getSimulations();

    let teamMembers = this.teamMemberService.getTeamMembers();
    localStorage.setItem(`simulation-${simulation.id}`, JSON.stringify(teamMembers));

    let tree = TeamMemberUtil.listToTree(teamMembers);
    if (tree.length == 0) return;

    TeamMemberUtil.calculateFields(tree);
    simulation.title = tree[0].data.title;
    simulation.grupalVolume = tree[0].data.gv;

    let monthlyBonusModel = TeamMemberUtil.calculateMonthlyBonus(tree[0]);
    let totalLeadershipBonus = monthlyBonusModel.leadershipBonusArr.reduce((a, b) => a + b, 0);
    simulation.totalBonus = monthlyBonusModel.personalBonus + monthlyBonusModel.grupalBonus + monthlyBonusModel.carBonus + totalLeadershipBonus;

    simulations.push(simulation);
    localStorage.setItem(this.storageKey, JSON.stringify(simulations));
  }

  getSimulations() {
    const simulations = localStorage.getItem(this.storageKey);
    return simulations ? JSON.parse(simulations) as SimulationModel[] : [];
  }

  private deleteSimulation(simulation: SimulationModel) {
    const simulations = this.getSimulations();
    const index = simulations.findIndex(x => x.id === simulation.id);
    if (index >= 0) {
      simulations.splice(index, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(simulations));
    }
  }
}

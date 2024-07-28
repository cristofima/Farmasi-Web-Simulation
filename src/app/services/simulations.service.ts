import { Injectable } from '@angular/core';
import { SimulationModel } from '../models/simulation.model';
import { TeamMemberService } from './team-member.service';
import { TeamMemberUtil } from '../utils/team-member.util';
import { TeamMemberModel } from '../models/team-member.model';
import { BonusUtil } from '../utils/bonus.util';
import { BonusCalculator } from '../utils/bonus-calculator.util';

@Injectable({
  providedIn: 'root'
})
export class SimulationsService {

  constructor(private teamMemberService: TeamMemberService) { }

  private storageKey = 'simulations';

  addSimulation(simulation: SimulationModel, simulationId?: string) {
    let simulations = this.getSimulations();
    this.addOrUpdateSimulation(simulation, simulations, true, simulationId);
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

  private addOrUpdateSimulation(simulation: SimulationModel, simulations: SimulationModel[], isAddAction = true, simulationId?: string) {
    let teamMembers: TeamMemberModel[] = [];
    if (isAddAction) {
      if (simulationId) {
        this.teamMemberService.setStorageKey(`simulation-${simulationId}`);
      } else {
        this.teamMemberService.setStorageKey('teamMembers');
      }

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
    simulation.personalVolume = tree[0].data.pv;
    simulation.bonusPercentage = tree[0].data.bonification;
    simulation.groupVolume = tree[0].data.gv;
    simulation.sidePoints = tree[0].data.sp;
    simulation.titlePoints = tree[0].data.tp;
    if (!isAddAction) simulation.lastUpdateDate = new Date();

    let monthlyBonusModel = BonusCalculator.calculateMonthlyBonus(tree[0]);

    simulation.monthlyBonus = monthlyBonusModel;
    simulation.totalBonus = BonusUtil.calculateTotalBonus(monthlyBonusModel);

    if (isAddAction) simulations.push(simulation);
    localStorage.setItem(this.storageKey, JSON.stringify(simulations));
  }
}

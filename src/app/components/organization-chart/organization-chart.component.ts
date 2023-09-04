import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { TeamMemberModel } from 'src/app/models/team-member.model';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { Guid } from 'js-guid';
import { TeamMemberUtil } from 'src/app/utils/team-member.util';
import { MonthlyBonusModel } from 'src/app/models/monthly-bonus.model';

@Component({
  selector: 'app-organization-chart',
  templateUrl: './organization-chart.component.html',
  styleUrls: ['./organization-chart.component.scss']
})
export class OrganizationChartComponent implements OnInit {

  constructor(private teamMemberService: TeamMemberService, private confirmationService: ConfirmationService, private messageService: MessageService) { }

  @Input() storageKey!: string;
  @Output("updateSimulationDetails") updateSimulationDetailsEvent = new EventEmitter<void>();
  private isSumulation = false;

  data: TreeNode[] = [];
  visible = false;
  showEditDialog = false;
  showDetailsDialog = false;
  members: TeamMemberModel[] = []
  selectedParentId!: string;
  selectedTreeNode!: TreeNode;
  private selectedId!: string;
  name!: string;
  personalVolume!: number;

  monthlyBonusModel?: MonthlyBonusModel;
  totalBonus = 0;
  totalLeadershipBonus = 0;

  ngOnInit(): void {
    if (this.storageKey) this.isSumulation = this.storageKey.includes('simulation');
    this.teamMemberService.setStorageKey(this.storageKey);
    this.resetDialog();
  }

  showDialog() {
    this.visible = true;
  }

  addTeamMember() {
    this.visible = false;
    let newTeamMember: TeamMemberModel = {
      id: Guid.newGuid().toString(),
      parentId: this.selectedParentId,
      name: this.name,
      personalVolume: this.personalVolume
    };

    this.teamMemberService.addTeamMember(newTeamMember);
    this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Miembro ${this.name} añadido` });
    this.resetDialog();
    if (this.isSumulation) this.updateSimulationDetailsEvent.emit();
  }

  loadEditDialog(treeNode: TreeNode) {
    this.showEditDialog = true;
    this.selectedId = treeNode.data.id;
    this.name = treeNode.data.name;
    this.personalVolume = treeNode.data.pv;
    this.selectedParentId = treeNode.data.parentId;
  }

  loadDetailsDialog(treeNode: TreeNode) {
    this.showDetailsDialog = true;
    this.selectedId = treeNode.data.id;
    this.selectedTreeNode = treeNode;
    this.monthlyBonusModel = undefined;
    this.totalLeadershipBonus = 0;
    this.totalBonus = 0;
    if (treeNode.data.bonification == 0) return;

    this.monthlyBonusModel = TeamMemberUtil.calculateMonthlyBonus(treeNode);
    this.totalLeadershipBonus = this.monthlyBonusModel.leadershipBonusArr.reduce((a, b) => a + b, 0);
    this.totalBonus = this.monthlyBonusModel.personalBonus + this.monthlyBonusModel.grupalBonus + this.monthlyBonusModel.carBonus + this.totalLeadershipBonus;
  }

  editTeamMember() {
    this.showEditDialog = false;
    this.teamMemberService.editTeamMember(this.selectedId, this.name, this.personalVolume, this.selectedParentId);
    this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Miembro ${this.name} actualizado` });
    this.resetDialog();
    if (this.isSumulation) this.updateSimulationDetailsEvent.emit();
  }

  deleteTeamMember(treeNode: TreeNode) {
    let name = treeNode.data.name;
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al miembro <b>${name}</b>?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamMemberService.deleteTeamMember(treeNode);
        this.resetDialog();
        if (this.isSumulation) this.updateSimulationDetailsEvent.emit();
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Miembro ${name} eliminado` });
      }
    });
  }

  private resetDialog() {
    this.name = "";
    this.personalVolume = 0;
    this.selectedParentId = "";
    this.members = this.teamMemberService.getTeamMembers();
    this.data = TeamMemberUtil.listToTree(this.members);
    TeamMemberUtil.calculateFields(this.data);
  }
}

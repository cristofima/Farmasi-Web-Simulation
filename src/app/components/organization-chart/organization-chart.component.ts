import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { TeamMemberModel } from 'src/app/models/team-member.model';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { Guid } from 'js-guid';
import { TeamMemberUtil } from 'src/app/utils/team-member.util';

@Component({
  selector: 'app-organization-chart',
  templateUrl: './organization-chart.component.html'
})
export class OrganizationChartComponent implements OnInit {

  constructor(private teamMemberService: TeamMemberService, private confirmationService: ConfirmationService, private messageService: MessageService) { }

  @Input() storageKey!: string;

  data: TreeNode[] = [];
  visible = false;
  showEditDialog = false;
  members: TeamMemberModel[] = []
  selectedParentId!: string;
  private selectedId!: string;
  name!: string;
  personalVolume!: number;

  ngOnInit(): void {
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
    this.resetDialog();
  }

  loadEditDialog(treeNode: TreeNode) {
    this.showEditDialog = true;
    this.selectedId = treeNode.data.id;
    this.name = treeNode.data.name
    this.personalVolume = treeNode.data.pv;
    this.selectedParentId = treeNode.data.parentId;
  }

  editTeamMember() {
    this.showEditDialog = false;
    this.teamMemberService.editTeamMember(this.selectedId, this.name, this.personalVolume, this.selectedParentId);
    this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Miembro ${this.name} actualizado` });
    this.resetDialog();
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

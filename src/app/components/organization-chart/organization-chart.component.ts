import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { TeamMemberModel } from 'src/app/models/team-member.model';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { Guid } from 'js-guid';
import { TeamMemberUtil } from 'src/app/utils/team-member.util';
import { MonthlyBonusModel } from 'src/app/models/monthly-bonus.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BonusCalculator } from 'src/app/utils/bonus-calculator.util';

@Component({
  selector: 'app-organization-chart',
  templateUrl: './organization-chart.component.html',
  styleUrls: ['./organization-chart.component.scss']
})
export class OrganizationChartComponent implements OnInit {

  constructor(private teamMemberService: TeamMemberService, private confirmationService: ConfirmationService, private messageService: MessageService, private formBuilder: FormBuilder) { }

  @Input() storageKey!: string;
  @Output("updateSimulationDetails") updateSimulationDetailsEvent = new EventEmitter<void>();
  private isSimulation = false;

  data: TreeNode[] = [];
  visible = false;
  isEdit = false;
  showDetailsDialog = false;
  members: TeamMemberModel[] = [];
  selectedTreeNode!: TreeNode;
  private selectedId!: string;

  monthlyBonusModel?: MonthlyBonusModel;

  formGroup!: FormGroup;

  ngOnInit(): void {
    if (this.storageKey) this.isSimulation = this.storageKey.includes('simulation');
    this.teamMemberService.setStorageKey(this.storageKey);

    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(25)])),
      personalVolume: new FormControl(0, Validators.compose([Validators.required, Validators.min(0)])),
      parentId: new FormControl(null, Validators.compose([Validators.required])),
      isNew: new FormControl(false)
    });

    this.resetOrganizationChart();
  }

  showDialog() {
    this.visible = true;
    this.isEdit = false;
    this.formGroup.reset();
  }

  addTeamMember() {
    this.visible = false;
    let newTeamMember: TeamMemberModel = {
      id: Guid.newGuid().toString(),
      parentId: this.formGroup.controls['parentId'].value,
      name: this.formGroup.controls['name'].value,
      isNew: this.formGroup.controls['isNew'].value,
      personalVolume: this.formGroup.controls['personalVolume'].value
    };

    this.teamMemberService.addTeamMember(newTeamMember);
    this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Miembro ${newTeamMember.name} añadido` });
    this.resetOrganizationChart();
    if (this.isSimulation) this.updateSimulationDetailsEvent.emit();
  }

  loadEditDialog(treeNode: TreeNode) {
    this.visible = true;
    this.isEdit = true;
    this.selectedId = treeNode.data.id;

    this.formGroup.setValue({
      name: treeNode.data.name,
      personalVolume: treeNode.data.pv,
      parentId: treeNode.data.parentId,
      isNew: treeNode.data.isNew
    });
  }

  loadDetailsDialog(treeNode: TreeNode) {
    this.showDetailsDialog = true;
    this.selectedId = treeNode.data.id;
    this.selectedTreeNode = treeNode;
    this.monthlyBonusModel = undefined;
    if (treeNode.data.bonification == 0) return;

    this.monthlyBonusModel = BonusCalculator.calculateMonthlyBonus(treeNode);
  }

  editTeamMember() {
    this.visible = false;
    let name = this.formGroup.controls['name'].value;
    let personalVolume = this.formGroup.controls['personalVolume'].value;
    let parentId = this.formGroup.controls['parentId'].value;
    let isNew = this.formGroup.controls['isNew'].value;

    this.teamMemberService.editTeamMember(this.selectedId, name, personalVolume, parentId, isNew);
    this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Miembro ${name} actualizado` });
    this.resetOrganizationChart();
    if (this.isSimulation) this.updateSimulationDetailsEvent.emit();
  }

  deleteTeamMember(treeNode: TreeNode) {
    let name = treeNode.data.name;
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al miembro <b>${name}</b>?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamMemberService.deleteTeamMember(treeNode);
        this.resetOrganizationChart();
        if (this.isSimulation) this.updateSimulationDetailsEvent.emit();
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Miembro ${name} eliminado` });
      }
    });
  }

  private resetOrganizationChart() {
    this.members = this.teamMemberService.getTeamMembers();
    this.data = TeamMemberUtil.listToTree(this.members);
    TeamMemberUtil.calculateFields(this.data);
  }
}

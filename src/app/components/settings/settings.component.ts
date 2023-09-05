import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SettingsModel } from 'src/app/models/settings.model';
import { TeamMemberModel } from 'src/app/models/team-member.model';
import { SettingsService } from 'src/app/services/settings.service';
import { TeamMemberService } from 'src/app/services/team-member.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private settingsService: SettingsService, private teamMemberService: TeamMemberService, private messageService: MessageService, private formBuilder: FormBuilder) { }

  settingsModel!: SettingsModel;
  formGroup!: FormGroup;

  ngOnInit(): void {
    this.settingsModel = this.settingsService.getSettings();
    this.formGroup = this.formBuilder.group({
      name: new FormControl(this.settingsModel.name, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(25)])),
      shoppingDrCTuna: new FormControl(this.settingsModel.shopping.drCTuna, Validators.compose([Validators.required, Validators.min(0)])),
      shoppingFarmasi: new FormControl(this.settingsModel.shopping.farmasi, Validators.compose([Validators.required, Validators.min(0)])),
      salesDrCTuna: new FormControl(this.settingsModel.sales.drCTuna, Validators.compose([Validators.required, Validators.min(0)])),
      salesFarmasi: new FormControl(this.settingsModel.sales.farmasi, Validators.compose([Validators.required, Validators.min(0)]))
    });
  }

  saveSettings() {
    this.settingsModel.name = this.formGroup.controls['name'].value;
    this.settingsModel.shopping.drCTuna = this.formGroup.controls['shoppingDrCTuna'].value;
    this.settingsModel.shopping.farmasi = this.formGroup.controls['shoppingFarmasi'].value;
    this.settingsModel.sales.drCTuna = this.formGroup.controls['salesDrCTuna'].value;
    this.settingsModel.sales.farmasi = this.formGroup.controls['salesFarmasi'].value;

    this.settingsService.saveSettings(this.settingsModel);
    let teamMember: TeamMemberModel = {
      id: this.settingsModel.id,
      name: this.settingsModel.name,
      personalVolume: this.settingsModel.shopping.drCTuna + this.settingsModel.shopping.farmasi + this.settingsModel.sales.drCTuna + this.settingsModel.sales.farmasi
    };

    this.teamMemberService.getTeamMember(teamMember.id) ? this.teamMemberService.editTeamMember(teamMember.id, teamMember.name, teamMember.personalVolume) : this.teamMemberService.addTeamMember(teamMember);
    this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Configuración actualizada' });
  }
}

import { Component, OnInit } from '@angular/core';
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

  constructor(private settingsService: SettingsService, private teamMemberService: TeamMemberService) { }

  settingsModel!: SettingsModel;

  ngOnInit(): void {
    this.settingsModel = this.settingsService.getSettings();
  }

  saveSettings() {
    this.settingsService.saveSettings(this.settingsModel);
    let teamMember: TeamMemberModel = {
      id: this.settingsModel.id,
      name: this.settingsModel.name,
      personalVolume: this.settingsModel.shopping.drCTuna + this.settingsModel.shopping.farmasi + this.settingsModel.sales.drCTuna + this.settingsModel.sales.farmasi
    };

    if (!this.settingsModel.id) {
      this.teamMemberService.addTeamMember(teamMember);
    } else {
      this.teamMemberService.editTeamMember(teamMember.id, teamMember.name, teamMember.personalVolume);
    }
  }
}
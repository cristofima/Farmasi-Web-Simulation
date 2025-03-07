import { Component, OnInit } from '@angular/core';
import { MonthlyBonusModel } from 'src/app/models/monthly-bonus.model';
import { SettingsModel } from 'src/app/models/settings.model';
import { SettingsService } from 'src/app/services/settings.service';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { BonusCalculator } from 'src/app/utils/bonus-calculator.util';
import { TeamMemberUtil } from 'src/app/utils/team-member.util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private settingsService: SettingsService, private teamMemberService: TeamMemberService) { }

  private settingsModel!: SettingsModel;
  personalVolume = 0;
  groupVolume = 0;
  bonusPercentage = 0
  sidePoints = 0;
  titlePoints = 0;
  title!: string;

  monthlyBonusModel!: MonthlyBonusModel;

  ngOnInit(): void {
    this.settingsModel = this.settingsService.getSettings();
    this.initData();
  }

  private initData() {
    this.personalVolume = this.settingsModel.personalVolume;

    this.teamMemberService.setStorageKey('teamMembers');
    let tree = TeamMemberUtil.listToTree(this.teamMemberService.getTeamMembers());
    if (tree.length == 0) return;

    TeamMemberUtil.calculateFields(tree);
    this.title = tree[0].data.title;
    this.bonusPercentage = tree[0].data.bonification;
    this.groupVolume = tree[0].data.gv;
    this.sidePoints = tree[0].data.sp;
    this.titlePoints = tree[0].data.tp;

    this.monthlyBonusModel = BonusCalculator.calculateMonthlyBonus(tree[0]);
  }

}

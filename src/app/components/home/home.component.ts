import { Component, OnInit } from '@angular/core';
import { MonthlyBonusModel } from 'src/app/models/monthly-bonus.model';
import { SettingsModel } from 'src/app/models/settings.model';
import { SettingsService } from 'src/app/services/settings.service';
import { TeamMemberService } from 'src/app/services/team-member.service';
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
  grupalVolume = 0;
  revenue = 0;
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
    this.personalVolume = this.settingsModel.shopping.drCTuna + this.settingsModel.shopping.farmasi + this.settingsModel.sales.drCTuna + this.settingsModel.sales.farmasi;
    this.revenue = this.settingsModel.sales.drCTuna * 0.5 + this.settingsModel.sales.farmasi * 0.3;

    this.teamMemberService.setStorageKey('teamMembers');
    let tree = TeamMemberUtil.listToTree(this.teamMemberService.getTeamMembers());
    if (tree.length == 0) return;

    TeamMemberUtil.calculateFields(tree);
    this.title = tree[0].data.title;
    this.bonusPercentage = tree[0].data.bonification;
    this.grupalVolume = tree[0].data.gv;
    this.sidePoints = tree[0].data.sp;
    this.titlePoints = tree[0].data.tp;

    this.monthlyBonusModel = TeamMemberUtil.calculateMonthlyBonus(tree[0]);
  }

}

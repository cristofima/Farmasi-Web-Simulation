import { Component, Input } from '@angular/core';
import { LeadershipGenerationDetail, MonthlyBonusModel } from 'src/app/models/monthly-bonus.model';
import { BonusUtil } from 'src/app/utils/bonus.util';

@Component({
  selector: 'app-monthly-bonuses',
  templateUrl: './monthly-bonuses.component.html'
})
export class MonthlyBonusesComponent {

  monthlyBonusModel?: MonthlyBonusModel;
  totalBonus = 0;
  showLeadershipDialog = false;
  selectedGeneration?: LeadershipGenerationDetail;

  @Input() title?: string;

  @Input("monthlyBonus") set monthlyBonus(value: MonthlyBonusModel | undefined) {
    this.monthlyBonusModel = value;
    if (this.monthlyBonusModel) {
      this.totalBonus = BonusUtil.calculateTotalBonus(this.monthlyBonusModel);
    }
  }

  openLeadershipDialog(): void {
    this.showLeadershipDialog = true;
    this.selectedGeneration = undefined;
  }

  get activeLeadershipDetails(): LeadershipGenerationDetail[] {
    if (!this.monthlyBonusModel?.leadershipDetails) return [];
    return this.monthlyBonusModel.leadershipDetails.filter(detail => detail.percentage > 0);
  }

  getTotalLeadershipBonus(): number {
    return this.activeLeadershipDetails.reduce((sum, detail) => sum + detail.amount, 0);
  }

  selectGeneration(detail: LeadershipGenerationDetail): void {
    this.selectedGeneration = this.selectedGeneration === detail ? undefined : detail;
  }

}

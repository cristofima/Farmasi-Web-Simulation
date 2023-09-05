import { Component, Input } from '@angular/core';
import { MonthlyBonusModel } from 'src/app/models/monthly-bonus.model';

@Component({
  selector: 'app-monthly-bonuses',
  templateUrl: './monthly-bonuses.component.html'
})
export class MonthlyBonusesComponent {

  monthlyBonusModel?: MonthlyBonusModel;
  totalBonus = 0;
  totalLeadershipBonus = 0;

  @Input("monthlyBonus") set monthlyBonus(value: MonthlyBonusModel | undefined) {
    this.monthlyBonusModel = value;
    if (this.monthlyBonusModel) {
      this.totalLeadershipBonus = this.monthlyBonusModel.leadershipBonusArr.reduce((a, b) => a + b, 0);
      this.totalBonus = this.monthlyBonusModel.personalBonus + this.monthlyBonusModel.grupalBonus + this.monthlyBonusModel.carBonus + this.totalLeadershipBonus;
    }
  }

}

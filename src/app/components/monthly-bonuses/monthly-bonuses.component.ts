import { Component, Input } from '@angular/core';
import { MonthlyBonusModel } from 'src/app/models/monthly-bonus.model';
import { BonusUtil } from 'src/app/utils/bonus.util';

@Component({
  selector: 'app-monthly-bonuses',
  templateUrl: './monthly-bonuses.component.html'
})
export class MonthlyBonusesComponent {

  monthlyBonusModel?: MonthlyBonusModel;
  totalBonus = 0;

  @Input("monthlyBonus") set monthlyBonus(value: MonthlyBonusModel | undefined) {
    this.monthlyBonusModel = value;
    if (this.monthlyBonusModel) {
      this.totalBonus = BonusUtil.calculateTotalBonus(this.monthlyBonusModel);
    }
  }

}

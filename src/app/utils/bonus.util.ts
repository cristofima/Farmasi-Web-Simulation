import { MonthlyBonusModel } from "../models/monthly-bonus.model";

export class BonusUtil {

  static calculateTotalBonus(monthlyBonusModel: MonthlyBonusModel) {
    const totalLeadershipBonus = monthlyBonusModel.leadershipBonusArr.reduce((a, b) => a + b, 0);
    return totalLeadershipBonus + monthlyBonusModel.personalBonus + monthlyBonusModel.groupBonus + monthlyBonusModel.carBonus;
  }
}

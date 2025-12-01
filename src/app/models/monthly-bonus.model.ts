export interface LeadershipFIDetail {
  name: string;
  bonification: number;
  gv: number;
}

export interface LeadershipGenerationDetail {
  generation: number;
  percentage: number;
  lgv: number;
  differentialLgv: number;
  amount: number;
  fis: LeadershipFIDetail[];
}

export interface MonthlyBonusModel {
  personalBonus: number;
  groupBonus: number;
  leadershipBonusArr: number[];
  leadershipDetails: LeadershipGenerationDetail[];
  carBonus: number;
}

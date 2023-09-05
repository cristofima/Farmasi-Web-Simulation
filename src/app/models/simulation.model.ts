import { MonthlyBonusModel } from "./monthly-bonus.model";

export interface SimulationModel {
  id: string;
  name: string;
  title?: string;
  grupalVolume?: number;
  sidePoints?: number;
  titlePoints?: number;
  monthlyBonus?: MonthlyBonusModel;
  totalBonus?: number;
  creationDate: Date;
  lastUpdateDate: Date;
}

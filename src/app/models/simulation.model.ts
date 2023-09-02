export interface SimulationModel {
  id: string;
  name: string;
  title?: string;
  grupalVolume: number;
  sidePoints: number;
  personalBonus?: number;
  grupalBonus?: number;
  carBonus?: number;
  leadershipBonusArr?: number[];
  totalBonus: number;
  creationDate: Date;
  lastUpdateDate: Date;
}

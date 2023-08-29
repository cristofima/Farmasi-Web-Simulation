export interface SettingsModel {
  id: string;
  name: string;
  shopping: LineItemModel;
  sales: LineItemModel;
}

export interface LineItemModel {
  drCTuna: number;
  farmasi: number;
}

import { Injectable } from '@angular/core';
import { SettingsModel } from '../models/settings.model';
import { Guid } from 'js-guid';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  getSettings() {
    return localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings')!) as SettingsModel : this.setDefaultSettings();
  }

  saveSettings(settingsModel: SettingsModel) {
    if (!settingsModel.id) settingsModel.id = Guid.newGuid().toString();
    localStorage.setItem('settings', JSON.stringify(settingsModel));
  }

  private setDefaultSettings(): SettingsModel {
    return {
      id: Guid.newGuid().toString(),
      name: "",
      shopping: {
        drCTuna: 0,
        farmasi: 0
      },
      sales: {
        drCTuna: 0,
        farmasi: 0
      }
    };
  }
}

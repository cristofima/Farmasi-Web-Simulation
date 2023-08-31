import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { OrganizationChartComponent } from './components/organization-chart/organization-chart.component';

const routes: Routes = [
  {
    path: "home",
    component: HomeComponent
  },
  {
    path: "team",
    component: OrganizationChartComponent
  },
  {
    path: "settings",
    component: SettingsComponent
  },
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

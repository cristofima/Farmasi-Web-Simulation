import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { OrganizationChartComponent } from './components/organization-chart/organization-chart.component';
import { SimulationsComponent } from './components/simulations/simulations.component';
import { SimulationDetailsComponent } from './components/simulation-details/simulation-details.component';

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
    path: "simulations",
    component: SimulationsComponent
  },
  {
    path: "simulations/:id",
    component: SimulationDetailsComponent
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

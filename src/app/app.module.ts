import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { OrganizationChartComponent } from './components/organization-chart/organization-chart.component';
import { SimulationsComponent } from './components/simulations/simulations.component';
import { SimulationDetailsComponent } from './components/simulation-details/simulation-details.component';
import { MonthlyBonusesComponent } from './components/monthly-bonuses/monthly-bonuses.component';

import { TabMenuModule } from 'primeng/tabmenu';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ConfirmationService, MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SettingsComponent,
    OrganizationChartComponent,
    SimulationsComponent,
    SimulationDetailsComponent,
    MonthlyBonusesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TabMenuModule,
    OrganizationChartModule,
    InputNumberModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    ScrollTopModule
  ],
  providers: [ConfirmationService, MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

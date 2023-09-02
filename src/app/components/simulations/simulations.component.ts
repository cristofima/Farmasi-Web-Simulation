import { Component, OnInit } from '@angular/core';
import { SimulationModel } from 'src/app/models/simulation.model';
import { SimulationsService } from 'src/app/services/simulations.service';
import { Guid } from 'js-guid';
import { Router } from '@angular/router';

@Component({
  selector: 'app-simulations',
  templateUrl: './simulations.component.html'
})
export class SimulationsComponent implements OnInit {

  constructor(private simulationsService: SimulationsService, private router: Router) { }

  simulations: SimulationModel[] = [];
  name!: string;
  showDialog = false;

  ngOnInit(): void {
    this.simulations = this.simulationsService.getSimulations();
  }

  goToDetails(id: string) {
    this.router.navigate(['/simulations', id]);
  }

  addSimulation() {
    this.showDialog = false;
    let simulation: SimulationModel = {
      id: Guid.newGuid().toString(),
      name: this.name,
      grupalVolume: 0,
      totalBonus: 0,
      creationDate: new Date(),
      lastUpdateDate: new Date()
    };

    this.simulationsService.addSimulation(simulation);
    this.router.navigate(['/simulations', simulation.id]);
  }
}

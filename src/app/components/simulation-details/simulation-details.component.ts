import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SimulationsService } from 'src/app/services/simulations.service';

@Component({
  selector: 'app-simulation-details',
  templateUrl: './simulation-details.component.html'
})
export class SimulationDetailsComponent implements OnInit {

  constructor(private actRoute: ActivatedRoute, private simulationsService: SimulationsService) { }

  simulationId!: string;
  storageKey!: string;

  ngOnInit(): void {
    this.actRoute.params.subscribe(params => {
      this.simulationId = params['id'];
      this.storageKey = `simulation-${this.simulationId}`
    });
  }

  updateSimulationDetails() {
    this.simulationsService.updateSimulationDetails(this.simulationId);
  }
}

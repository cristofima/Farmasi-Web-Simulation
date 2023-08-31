import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simulation-details',
  templateUrl: './simulation-details.component.html',
  styleUrls: ['./simulation-details.component.scss']
})
export class SimulationDetailsComponent implements OnInit {

  constructor(private actRoute: ActivatedRoute) { }

  simulationId!: string;
  storageKey!: string;

  ngOnInit(): void {
    this.actRoute.params.subscribe(params => {
      this.simulationId = params['id'];
      this.storageKey = `simulation-${this.simulationId}`
    });
  }
}

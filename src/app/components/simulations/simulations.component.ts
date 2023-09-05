import { Component, OnInit } from '@angular/core';
import { SimulationModel } from 'src/app/models/simulation.model';
import { SimulationsService } from 'src/app/services/simulations.service';
import { Guid } from 'js-guid';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-simulations',
  templateUrl: './simulations.component.html'
})
export class SimulationsComponent implements OnInit {

  constructor(private simulationsService: SimulationsService, private router: Router, private confirmationService: ConfirmationService, private messageService: MessageService, private formBuilder: FormBuilder) { }

  simulations: SimulationModel[] = [];
  visible = false;

  formGroup!: FormGroup;

  ngOnInit(): void {
    this.simulations = this.simulationsService.getSimulations();

    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(25)])),
    });
  }

  showDialog() {
    this.visible = true;
    this.formGroup.reset();
  }

  goToDetails(id: string) {
    this.router.navigate(['/simulations', id]);
  }

  addSimulation() {
    this.visible = false;
    let simulation: SimulationModel = {
      id: Guid.newGuid().toString(),
      name: this.formGroup.controls['name'].value,
      creationDate: new Date(),
      lastUpdateDate: new Date()
    };

    this.simulationsService.addSimulation(simulation);
    this.router.navigate(['/simulations', simulation.id]);
    this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Simulación ${simulation.name} creada` });
  }

  deleteSimulation(simulation: SimulationModel) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la simulación <b>${simulation.name}</b>?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.simulationsService.deleteSimulation(simulation.id);
        this.simulations = this.simulationsService.getSimulations();
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Simulación ${simulation.name} eliminada` });
      }
    });
  }
}

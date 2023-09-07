import { Component, OnInit } from '@angular/core';
import { SimulationModel } from 'src/app/models/simulation.model';
import { SimulationsService } from 'src/app/services/simulations.service';
import { Guid } from 'js-guid';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, SelectItemGroup } from 'primeng/api';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-simulations',
  templateUrl: './simulations.component.html'
})
export class SimulationsComponent implements OnInit {

  constructor(private simulationsService: SimulationsService, private router: Router, private confirmationService: ConfirmationService, private messageService: MessageService, private formBuilder: FormBuilder) { }

  simulations: SimulationModel[] = [];
  visible = false;
  enableAddButton = false;

  groupedSimulations!: SelectItemGroup[];

  formGroup!: FormGroup;

  ngOnInit(): void {
    this.simulations = this.simulationsService.getSimulations();
    this.enableAddButton = localStorage.getItem('settings') !== null;

    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(25)])),
      team: new FormControl('', Validators.compose([Validators.required]))
    });

    if (this.enableAddButton) this.buildItemsGroup();
  }

  private buildItemsGroup() {
    this.groupedSimulations = [];
    let items: SelectItemGroup[] = [
      {
        label: 'Equipo',
        value: 'team',
        items: [
          { label: 'Equipo Actual', value: 'current-team' }
        ]
      },
      {
        label: 'Simulaciones',
        value: 'simulations',
        items: []
      }
    ];

    this.simulations.forEach(simulation => {
      let item = {
        label: simulation.name,
        value: simulation.id
      };

      items[1].items.push(item);
    });

    this.groupedSimulations = items;
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

    let team = this.formGroup.controls['team'].value;
    if (team == 'current-team') team = null;

    this.simulationsService.addSimulation(simulation, team);
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
        this.simulations = this.simulations.filter(s => s.id != simulation.id);
        this.groupedSimulations[1].items = this.groupedSimulations[1].items.filter(s => s.value != simulation.id);
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: `Simulación ${simulation.name} eliminada` });
      }
    });
  }
}

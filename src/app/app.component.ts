import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      { label: 'Inicio', icon: 'pi pi-fw pi-home', routerLink: ['/home'] },
      { label: 'Equipo', icon: 'pi pi-fw pi-users', routerLink: ['/team'] },
      { label: 'Simulaciones', icon: 'pi pi-fw pi-list', routerLink: ['/simulations'] },
      { label: 'Configuración', icon: 'pi pi-fw pi-cog', routerLink: ['/settings'] }
    ];
  }
}

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
      { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/home'] },
      { label: 'Team', icon: 'pi pi-fw pi-users', routerLink: ['/team'] },
      { label: 'Simulations', icon: 'pi pi-fw pi-list', routerLink: ['/simulations'] },
      { label: 'Settings', icon: 'pi pi-fw pi-cog', routerLink: ['/settings'] }
    ];
  }
}

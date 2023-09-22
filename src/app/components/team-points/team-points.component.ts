import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-team-points',
  templateUrl: './team-points.component.html'
})
export class TeamPointsComponent {

  @Input() personalVolume!: number;
  @Input() grupalVolume!: number;
  @Input() bonusPercentage!: number;
  @Input() title!: string;
  @Input() sidePoints!: number;
  @Input() titlePoints!: number;
}

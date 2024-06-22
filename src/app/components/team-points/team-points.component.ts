import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-team-points',
  templateUrl: './team-points.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamPointsComponent {

  @Input() personalVolume!: number;
  @Input() groupVolume!: number;
  @Input() bonusPercentage!: number;
  @Input() title!: string;
  @Input() sidePoints!: number;
  @Input() titlePoints!: number;
}

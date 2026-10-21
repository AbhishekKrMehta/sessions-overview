import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconsModule } from '@progress/kendo-angular-icons';
import { exclamationCircleIcon, SVGIcon } from '@progress/kendo-svg-icons';

@Component({
  selector: 'app-sessions-error',
  standalone: true,
  imports: [IconsModule],
  templateUrl: './sessions-error.component.html',
  styleUrls: ['./sessions-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsErrorComponent {
  readonly message = input.required<string>();
  readonly retry = output<void>();

  readonly warningIcon: SVGIcon = exclamationCircleIcon;
}

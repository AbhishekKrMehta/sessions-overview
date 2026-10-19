import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SessionsOverviewComponent } from './sessions/sessions-overview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SessionsOverviewComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}

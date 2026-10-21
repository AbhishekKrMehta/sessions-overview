import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { IconsModule } from "@progress/kendo-angular-icons";
import { arrowRotateCcwIcon, SVGIcon } from "@progress/kendo-svg-icons";

@Component({
  selector: "app-sessions-header",
  standalone: true,
  imports: [IconsModule],
  templateUrl: "./sessions-header.component.html",
  styleUrls: ["./sessions-header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsHeaderComponent {
  readonly isFiltered = input<boolean>(false);
  readonly clearFilters = output<void>();

  readonly resetIcon: SVGIcon = arrowRotateCcwIcon;
}

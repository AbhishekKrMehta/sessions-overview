import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "@progress/kendo-angular-buttons";
import { DateInputsModule } from "@progress/kendo-angular-dateinputs";
import { DropDownListModule } from "@progress/kendo-angular-dropdowns";
import {
  GridDataResult,
  GridModule,
  PageChangeEvent,
} from "@progress/kendo-angular-grid";
import { IconsModule } from "@progress/kendo-angular-icons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { SortDescriptor } from "@progress/kendo-data-query";
import {
  arrowRotateCcwIcon,
  checkIcon,
  copyIcon,
  exclamationCircleIcon,
  SVGIcon,
} from "@progress/kendo-svg-icons";
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
} from "rxjs";
import { FakeSessionService } from "../fake/fake-session.service";
import {
  Session,
  SessionFilter,
  SessionQuery,
  SessionSort,
  SessionSortDirection,
} from "../fake/session.model";
import {
  hasActiveFilters,
  mapFormValueToSessionFilters,
  SessionFilterFormValue,
} from "./session-filters";
import {
  formatCost,
  formatDuration,
  formatEnergy,
  formatStartedDate,
  getUserInitial,
  truncateSessionId,
} from "./session-formatters";
import { SessionsErrorComponent } from "./components/sessions-error/sessions-error.component";
import { SessionsHeaderComponent } from "./components/sessions-header/sessions-header.component";

@Component({
  selector: "app-sessions-overview",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GridModule,
    DropDownListModule,
    DateInputsModule,
    InputsModule,
    ButtonModule,
    IconsModule,
    SessionsHeaderComponent,
    SessionsErrorComponent,
  ],
  templateUrl: "./sessions-overview.component.html",
  styleUrls: ["./sessions-overview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsOverviewComponent implements OnInit {
  private readonly fakeSessionService = inject(FakeSessionService);
  private readonly destroyRef = inject(DestroyRef);

  // Pagination & Sorting state
  skip = 0;
  pageSize = 10;
  sort: SortDescriptor[] = [];
  protected activeFilters: SessionFilter[] = [];

  // View state as clean Signals for OnPush change detection
  readonly gridData = signal<GridDataResult>({ data: [], total: 0 });
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isFiltered = signal<boolean>(false);
  readonly copiedSessionId = signal<string | null>(null);

  // Filter Form Controls
  readonly filterForm = new FormGroup({
    chargerName: new FormControl<string | null>(null),
    chargerLocation: new FormControl<string>(""),
    status: new FormControl<Session["status"] | null>(null),
    startedFrom: new FormControl<Date | null>(null),
    startedTo: new FormControl<Date | null>(null),
    minDuration: new FormControl<number | null>(null),
    maxDuration: new FormControl<number | null>(null),
    minEnergy: new FormControl<number | null>(null),
    minCost: new FormControl<number | null>(null),
    user: new FormControl<string>(""),
    id: new FormControl<string>(""),
  });

  // Dropdown options
  allChargers: string[] = [];
  chargerDropdownData: string[] = [];
  readonly statusOptions: Session["status"][] = [
    "Active",
    "Completed",
    "Failed",
    "Cancelled",
  ];

  // Kendo SVG Icons
  readonly resetIcon: SVGIcon = arrowRotateCcwIcon;
  readonly warningIcon: SVGIcon = exclamationCircleIcon;
  readonly copyIcon: SVGIcon = copyIcon;
  readonly checkIcon: SVGIcon = checkIcon;

  // Expose pure formatters to template
  readonly formatDuration = formatDuration;
  readonly formatEnergy = formatEnergy;
  readonly formatCost = formatCost;
  readonly formatStartedDate = formatStartedDate;
  readonly getUserInitial = getUserInitial;
  readonly truncateSessionId = truncateSessionId;

  // RxJS pipeline trigger for server queries
  protected readonly queryTrigger$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    this.loadChargers();
    this.setupFilterListener();
    this.setupQueryPipeline();
  }

  private loadChargers(): void {
    this.fakeSessionService
      .getChargers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (chargers) => {
          this.allChargers = chargers;
          this.chargerDropdownData = chargers;
        },
        error: () => {},
      });
  }

  onChargerFilter(searchTerm: string): void {
    const term = (searchTerm || "").toLowerCase().trim();
    this.chargerDropdownData = this.allChargers.filter((c) =>
      c.toLowerCase().includes(term)
    );
  }

  // 1. RxJS handles debouncing user typing on filter inputs
  private setupFilterListener(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((formValue) => {
        this.skip = 0; // Reset pagination to page 1 on filter changes
        this.activeFilters = mapFormValueToSessionFilters(
          formValue as SessionFilterFormValue
        );
        this.isFiltered.set(
          hasActiveFilters(formValue as SessionFilterFormValue)
        );
        this.queryTrigger$.next();
      });
  }

  // 2. RxJS handles request cancellation (switchMap) and error isolation
  private setupQueryPipeline(): void {
    this.queryTrigger$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap(() => {
          const query: SessionQuery = {
            skip: this.skip,
            take: this.pageSize,
            sort: this.mapSortDescriptors(this.sort),
            filters: this.activeFilters,
          };
          return this.fakeSessionService.getSessions(query).pipe(
            catchError((err: Error) => {
              this.errorMessage.set(
                err?.message || "Failed to load sessions. Please try again."
              );
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((page) => {
        this.loading.set(false);
        if (page) {
          this.gridData.set({
            data: page.data,
            total: page.total,
          });
        }
      });
  }

  onPageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.pageSize = event.take;
    this.queryTrigger$.next();
  }

  onSortChange(descriptors: SortDescriptor[]): void {
    this.sort = descriptors;
    this.queryTrigger$.next();
  }

  retry(): void {
    this.queryTrigger$.next();
  }

  clearFilters(): void {
    this.filterForm.reset({
      chargerName: null,
      chargerLocation: "",
      status: null,
      startedFrom: null,
      startedTo: null,
      minDuration: null,
      maxDuration: null,
      minEnergy: null,
      minCost: null,
      user: "",
      id: "",
    });
  }

  copySessionId(id: string): void {
    if (!id) return;
    navigator.clipboard?.writeText(id).then(() => {
      this.copiedSessionId.set(id);
      setTimeout(() => {
        if (this.copiedSessionId() === id) {
          this.copiedSessionId.set(null);
        }
      }, 2000);
    });
  }

  private mapSortDescriptors(descriptors: SortDescriptor[]): SessionSort[] {
    return (descriptors || [])
      .filter((s) => s.dir != null)
      .map((s) => ({
        field: s.field as keyof Session,
        direction: s.dir as SessionSortDirection,
      }));
  }
}

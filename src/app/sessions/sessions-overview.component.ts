import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  GridDataResult,
  GridModule,
  PageChangeEvent,
} from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { BehaviorSubject, catchError, of, switchMap, tap } from 'rxjs';
import { FakeSessionService } from '../fake/fake-session.service';
import {
  Session,
  SessionFilter,
  SessionQuery,
  SessionSort,
  SessionSortDirection,
} from '../fake/session.model';
import {
  formatCost,
  formatDuration,
  formatEnergy,
  formatStartedDate,
  getUserInitial,
  truncateSessionId,
} from './session-formatters';

@Component({
  selector: 'app-sessions-overview',
  standalone: true,
  imports: [CommonModule, GridModule],
  templateUrl: './sessions-overview.component.html',
  styleUrls: ['./sessions-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsOverviewComponent implements OnInit {
  private readonly fakeSessionService = inject(FakeSessionService);
  private readonly destroyRef = inject(DestroyRef);

  // Pagination & Sorting state
  skip = 0;
  pageSize = 10;
  sort: SortDescriptor[] = [];

  // Active filters (will be populated via filter controls in Milestone 3)
  protected activeFilters: SessionFilter[] = [];

  // Signals for view binding
  readonly gridData = signal<GridDataResult>({ data: [], total: 0 });
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Expose pure formatters to template
  readonly formatDuration = formatDuration;
  readonly formatEnergy = formatEnergy;
  readonly formatCost = formatCost;
  readonly formatStartedDate = formatStartedDate;
  readonly getUserInitial = getUserInitial;
  readonly truncateSessionId = truncateSessionId;

  // RxJS pipeline trigger
  protected readonly queryTrigger$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    this.setupQueryPipeline();
  }

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
                err?.message || 'Failed to load sessions. Please try again.',
              );
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
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

  private mapSortDescriptors(descriptors: SortDescriptor[]): SessionSort[] {
    return (descriptors || [])
      .filter((s) => s.dir != null)
      .map((s) => ({
        field: s.field as keyof Session,
        direction: s.dir as SessionSortDirection,
      }));
  }
}


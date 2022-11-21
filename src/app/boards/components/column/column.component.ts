import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { IColumnFull, TNewColumn } from '../../interfaces/column.interface';
import { ColumnsService } from '../../services/columns.service';
// eslint-disable-next-line max-len
import { ConfirmationComponent } from '../../../shared/components/confirmation/confirmation.component';
import {
  TTaskConfirmationModal,
  TTask,
  ITask,
} from '../../interfaces/task.interface';
import { UserStateService } from '../../../core/services/user-state.service';
import { TasksModalComponent } from '../../modals/tasks/tasks-modal.component';
import { MODAL_WIDTH } from '../../../shared/constants';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnComponent implements OnDestroy {
  @Input() column!: IColumnFull;

  @Input() boardId!: string;

  private subscription = new Subscription();

  constructor(
    private columnsService: ColumnsService,
    private matDialog: MatDialog,
    private userStateService: UserStateService,
    private tasksService: TasksService,
  ) {}

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onClickDeleteColumn(event: MouseEvent) {
    event.stopPropagation();
    const message = {
      title: 'Delete Column',
      description: 'Would you like to delete this Column?',
    };
    this.subscription.add(
      this.openDialog(message).subscribe((result) => {
        if (result) {
          this.columnsService.delete(this.column.id, this.boardId);
        }
      }),
    );
  }

  public onClickCreateTask(): void {
    const modalConfig: TTaskConfirmationModal = {
      title: '',
      description: '',
      userId: this.userStateService.user!.id,
      confirmationTitleText: 'Create new Task',
      confirmationButtonText: 'Create',
    };
    this.subscription.add(
      this.openModalWindow(modalConfig).subscribe((newTask) => {
        if (newTask) {
          this.tasksService.create(this.boardId, this.column.id, newTask);
        }
      }),
    );
  }

  public drop(event: CdkDragDrop<ITask[]>) {
    if (event.container === event.previousContainer) {
      moveItemInArray(
        this.column.tasks,
        event.previousIndex,
        event.currentIndex,
      );
      const currentOrder = event.currentIndex + 1;
      this.subscription.add(
        this.columnsService.updateTasks(
          this.boardId,
          this.column.id,
          this.column.tasks[event.currentIndex],
          currentOrder,
        ),
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  private openDialog(message: TNewColumn): Observable<boolean> {
    const dialogRef = this.matDialog.open(ConfirmationComponent, {
      data: message,
    });
    return dialogRef.afterClosed();
  }

  private openModalWindow(data: TTaskConfirmationModal): Observable<TTask> {
    const dialogRef = this.matDialog.open(TasksModalComponent, {
      width: MODAL_WIDTH,
      data,
      disableClose: true,
    });
    return dialogRef.afterClosed();
  }
}

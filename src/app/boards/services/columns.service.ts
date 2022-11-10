import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TColumn } from '../interfaces/column.interface';
import { ApiColumnsService } from './api-columns.service';

@Injectable()
export class ColumnsService {
  private columns$ = new BehaviorSubject<TColumn[]>([]);

  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiColumns: ApiColumnsService) {}

  public loadAll(boardId: string): void {
    this.isLoading$.next(true);
    this.apiColumns.getAll(boardId).subscribe((columns) => {
      this.columns$.next(columns);
      this.isLoading$.next(false);
    });
  }

  public get columns(): Observable<TColumn[]> {
    return this.columns$.asObservable();
  }

  public get isLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }
}

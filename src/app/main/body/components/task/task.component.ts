import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TaskModel } from 'src/app/models/task.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { token } from 'src/app/app.component';
import { UserModel } from 'src/app/models/user.model';
import { TaskItemModel } from 'src/app/models/taskItem.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() userSession: UserModel = new UserModel();

  createTask: boolean = false;
  taskSelected: TaskModel = new TaskModel();
  taskItens: TaskItemModel[] = [];
  itemTask: TaskItemModel = new TaskItemModel();

  displayedColumns: string[] = [
    'id',
    'title',
    'description',
    'status',
    'responsible',
    'options',
  ];
  dataSource: MatTableDataSource<TaskModel> =
    new MatTableDataSource<TaskModel>();

  displayedColumnsTaskItem: string[] = ['title', 'status', 'options'];
  dataSourceTaskItem: MatTableDataSource<TaskItemModel> =
    new MatTableDataSource<TaskItemModel>();

  getTaskSub: Subscription = new Subscription();
  getUserSub: Subscription = new Subscription();
  updateTaskSub: Subscription = new Subscription();
  saveTaskSub: Subscription = new Subscription();
  onDeleteSub: Subscription = new Subscription();

  responsibles: UserModel[] = [];
  apiService = inject(ApiService);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  constructor(public dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.getTasks();
    this.getUsers();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.pageSize = 10;

      this.dataSource.paginator = this.paginator;
      this.dataSourceTaskItem.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
    this.dataSourceTaskItem.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.getTaskSub ? this.getTaskSub.unsubscribe() : null;
    this.getUserSub ? this.getUserSub.unsubscribe() : null;
    this.updateTaskSub ? this.updateTaskSub.unsubscribe() : null;
    this.saveTaskSub ? this.saveTaskSub.unsubscribe() : null;
    this.onDeleteSub ? this.onDeleteSub.unsubscribe() : null;
  }

  getUsers() {
    this.getUserSub = this.apiService.getUsers().subscribe({
      next: (data: any) => {
        this.responsibles = data;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  getTasks(): void {
    this.getTaskSub = this.apiService
      .getTasksByUser(this.userSession.id)
      .subscribe({
        next: (data: any) => {
          this.dataSource.data = data;
          this.dataSource._updateChangeSubscription();
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createNewTask() {
    this.createTask = true;
    this.taskSelected = new TaskModel();
  }

  handleTask(task: TaskModel) {
    task.id ? this.updateTask(task) : this.saveTask(task);
  }

  validateTask(task: TaskModel): boolean {
    let invalid: boolean = false;
    if (!task.title) {
      this.openSnackBar('Título é obrigatório');
      return (invalid = true);
    }
    if (!task.description) {
      this.openSnackBar('Descrição é obrigatório');
      return (invalid = true);
    }
    if (this.taskItens.length === 0) {
      this.openSnackBar('Adicione ao menos um item');
      return (invalid = true);
    }
    if (!task.user) {
      this.openSnackBar('Adicione um usuário responsável');
      return (invalid = true);
    }
    return invalid;
  }

  updateTask(task: TaskModel) {
    if (this.validateTask(task)) return;
    task.itens = JSON.stringify(this.taskItens);

    this.updateTaskSub = this.apiService.updateTask(task).subscribe({
      next: (data: any) => {
        const index = this.dataSource.data.findIndex((u) => u.id === task.id);
        this.dataSource.data[index] = data;
        this.dataSource._updateChangeSubscription();
        this.taskSelected = new TaskModel();
        this.createTask = false;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  handleChangeStatusTask(task: TaskModel) {
    task.status = task.status === 'Concluída' ? 'Pendente' : 'Concluída';
    this.taskItens = JSON.parse(task.itens);
    this.updateTask(task);
  }

  saveTask(task: TaskModel) {
    task.itens = JSON.stringify(this.taskItens);
    if (this.validateTask(task)) return;

    this.saveTaskSub = this.apiService.saveTask(task).subscribe({
      next: (data: any) => {
        this.dataSource.data.push(data);
        this.dataSource._updateChangeSubscription();
        this.taskSelected = new TaskModel();
        this.createTask = false;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  onEdit(task: TaskModel) {
    this.taskSelected = task;
    this.taskItens = JSON.parse(task.itens);
    this.createTask = true;
    this.dataSourceTaskItem.data = this.taskItens;
    this.dataSourceTaskItem._updateChangeSubscription();
  }

  onDelete(task: TaskModel) {
    this.onDeleteSub = this.apiService.deleteTask(task.id).subscribe({
      next: (data: any) => {
        const index = this.dataSource.data.findIndex((u) => u.id === task.id);
        this.dataSource.data.splice(index, 1);
        this.dataSource._updateChangeSubscription();
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  removeItem(index: number) {
    this.taskItens.splice(index, 1);
    this.dataSourceTaskItem.data = this.taskItens;
    this.dataSourceTaskItem._updateChangeSubscription();
  }

  addItemTask() {
    this.taskItens.push(this.itemTask);
    this.itemTask = new TaskItemModel();
    this.dataSourceTaskItem.data = this.taskItens;
    this.dataSourceTaskItem._updateChangeSubscription();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Fechar');
  }

  compareObjects(o1: any, o2: any) {
    if (o1.id == o2.id) {
      return true;
    } else {
      return false;
    }
  }
}

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
import { UserModel } from 'src/app/models/user.model';
import { UserModalComponent } from './user-modal/user-modal.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
// import { token } from 'src/app/app.component';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() userSession: UserModel = new UserModel();

  createUser: boolean = false;
  userSelected: UserModel = new UserModel();

  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'password',
    'role',
    'options',
  ];
  dataSource: MatTableDataSource<UserModel> =
    new MatTableDataSource<UserModel>();

  headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: '',
  });

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  apiService = inject(ApiService);

  getUserSub: Subscription = new Subscription();
  saveUserSub: Subscription = new Subscription();
  updateUserSub: Subscription = new Subscription();
  onDeleteSub: Subscription = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cookies: CookieService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.pageSize = 10;
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.getUserSub ? this.getUserSub.unsubscribe() : null;
    this.saveUserSub ? this.saveUserSub.unsubscribe() : null;
    this.updateUserSub ? this.updateUserSub.unsubscribe() : null;
    this.onDeleteSub ? this.onDeleteSub.unsubscribe() : null;
  }

  getUsers(): void {
    this.getUserSub = this.apiService.getUsers().subscribe({
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

  createNewUser() {
    this.createUser = true;
    this.userSelected = new UserModel();
  }

  handleUser(user: UserModel) {
    user.id ? this.updateUser(user) : this.saveUser(user);
  }

  validateUser(user: UserModel): boolean {
    let invalid: boolean = false;
    if (!user.username) {
      this.openSnackBar('Nome é obrigatório');
      return (invalid = true);
    }
    if (!user.email) {
      this.openSnackBar('Email é obrigatório');
      return (invalid = true);
    }
    if (!user.password) {
      this.openSnackBar('Senha é obrigatória');
      return (invalid = true);
    }
    if (!user.role) {
      this.openSnackBar('Tipo de usuário é obrigatória');
      return (invalid = true);
    }
    return invalid;
  }

  updateUser(user: UserModel) {
    if (this.validateUser(user)) return;

    this.updateUserSub = this.apiService.updateUser(user).subscribe({
      next: (data: any) => {
        const index = this.dataSource.data.findIndex((u) => u.id === user.id);
        user.id === this.userSession.id
          ? this.cookies.set('userSession', JSON.stringify(data))
          : null;
        this.dataSource.data[index] = data;
        this.dataSource._updateChangeSubscription();
        this.userSelected = new UserModel();
        this.createUser = false;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  saveUser(user: UserModel) {
    if (this.validateUser(user)) return;

    this.saveUserSub = this.apiService.saveUser(user).subscribe({
      next: (data: any) => {
        this.dataSource.data.push(data);
        this.dataSource._updateChangeSubscription();
        this.userSelected = new UserModel();
        this.createUser = false;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  onEdit(user: UserModel) {
    this.userSelected = user;
    this.createUser = true;
  }

  onDelete(user: UserModel) {
    this.onDeleteSub = this.apiService.deleteUser(user.id).subscribe({
      next: (data: any) => {
        const index = this.dataSource.data.findIndex((u) => u.id === user.id);
        this.dataSource.data.splice(index, 1);
        this.dataSource._updateChangeSubscription();
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  openDialog(user: UserModel): void {
    if (user.id == this.userSession.id) {
      return this.openSnackBar('Você não pode excluir seu próprio usuário');
    }
    this.userSelected = user;
    const dialogRef = this.dialog.open(UserModalComponent, {
      data: user,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onDelete(this.userSelected);
      }
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Fechar');
  }
}

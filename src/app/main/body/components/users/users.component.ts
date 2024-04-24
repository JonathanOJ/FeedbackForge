import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserModel } from 'src/app/models/user.model';
import { UserModalComponent } from './user-modal/user-modal.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements AfterViewInit {
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

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  constructor(public dialog: MatDialog, private http: HttpClient) {
    const fakeUsers: UserModel[] = [
      {
        id: 1,
        username: 'User 1',
        email: 'jona@gmail.com',
        password: '123456',
        role: 'Admin',
      },
      {
        id: 2,
        username: 'User 2',
        email: 'cleiton@gmail.com',
        password: '123456',
        role: 'Admin',
      },
      // Add more fake Users as needed
    ];

    // Assign the fake data to the dataSource
    this.dataSource = new MatTableDataSource<UserModel>(fakeUsers);
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
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

  saveUser(user: UserModel) {
    // Save the User to the database
    console.log(user);
    // Add the new User to the dataSource
    this.dataSource.data.push(user);
    this.dataSource._updateChangeSubscription();

    this.http.post('http://localhost:8080/users/save', user).subscribe({
      next: (data: any) => {
        this.dataSource.data.push(data);
        this.dataSource._updateChangeSubscription();
      },
      error: (error: any) => {
        console.log(error);
      },
    });
    // Reset the User
    this.userSelected = new UserModel();
    this.createUser = false;
  }

  onEdit(user: UserModel) {
    this.userSelected = user;
    this.createUser = true;
  }

  onDelete(user: UserModel) {
    this.http.delete(`http://localhost:8080/users/${user.id}`).subscribe({
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
}

import { Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
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

  constructor() {
    const fakeUsers: UserModel[] = [
      {
        id: 1,
        name: 'User 1',
        email: 'jona@gmail.com',
        password: '123456',
        role: 'Admin',
      },
      {
        id: 2,
        name: 'User 2',
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

    // Reset the User
    this.userSelected = new UserModel();
    this.createUser = false;
  }

  onEdit(user: UserModel) {
    this.userSelected = user;
    this.createUser = true;
  }

  onDelete(user: UserModel) {
    console.log(user);
  }
}

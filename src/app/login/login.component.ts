import { Component, OnDestroy } from '@angular/core';
import { UserModel } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  createUser: boolean = false;
  user: UserModel = new UserModel();

  confirmPassword: string = '';
  loginSub: Subscription = new Subscription();
  createUserSub: Subscription = new Subscription();

  constructor(
    private httpClient: HttpClient,
    private cookies: CookieService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy(): void {
    this.loginSub ? this.loginSub.unsubscribe() : null;
    this.createUserSub ? this.createUserSub.unsubscribe() : null;
  }

  toggleCreateUser() {
    this.createUser = !this.createUser;
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Fechar');
  }

  handleInfo() {
    if (!this.user.username) {
      return this.openSnackBar('O campo de usuário é obrigatório');
    }
    if (!this.user.email) {
      return this.openSnackBar('O campo de email é obrigatório');
    }

    if (!this.user.password) {
      return this.openSnackBar('O campo de senha é obrigatório');
    }

    if (this.user.password !== this.confirmPassword) {
      return this.openSnackBar('As senhas não coincidem');
    }
    this.handleCreateUser();
  }

  handleCreateUser() {
    this.createUserSub = this.httpClient
      .post('http://localhost:8080/user/save', this.user)
      .subscribe({
        next: (data: any) => {
          this.cookies.set('userSession', JSON.stringify(data));
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  login() {
    this.loginSub = this.httpClient
      .post('http://localhost:8080/user/login', this.user)
      .subscribe({
        next: (data: any) => {
          this.cookies.set('userSession', JSON.stringify(data));
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
}

import { Component, inject, OnDestroy } from '@angular/core';
import { UserModel } from '../models/user.model';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../services/api.service';

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

  headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: '',
  });

  private apiService = inject(ApiService);

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
      .post('http://localhost:8080/user/register', this.user, {
        observe: 'response',
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          const token = 'Bearer ' + response.body.token;

          if (token) {
            this.cookies.check('token') ? this.cookies.delete('token') : '';
            this.cookies.check('userSession')
              ? this.cookies.delete('userSession')
              : '';

            this.cookies.set('token', token);
            this.cookies.set('userSession', JSON.stringify(response.body.user));

            this.apiService.setHeaders(token);

            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 250);
          }
        },
        error: (error: any) => {
          typeof error.error === 'string'
            ? this.openSnackBar(error.error)
            : this.openSnackBar('Erro ao registrar usuário');
        },
      });
  }

  login() {
    this.loginSub = this.httpClient
      .post('http://localhost:8080/user/login', this.user, {
        observe: 'response',
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          const token = 'Bearer ' + response.body.token;

          if (token) {
            this.cookies.check('token') ? this.cookies.delete('token') : '';
            this.cookies.check('userSession')
              ? this.cookies.delete('userSession')
              : '';

            this.cookies.set('token', token);
            this.cookies.set('userSession', JSON.stringify(response.body.user));

            this.apiService.setHeaders(token);

            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 250);
          }
        },
        error: (error: any) => {
          typeof error.error === 'string'
            ? this.openSnackBar(error.error)
            : this.openSnackBar('Erro ao fazer login');
        },
      });
  }
}

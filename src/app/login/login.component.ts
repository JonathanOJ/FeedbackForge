import { Component, OnDestroy } from '@angular/core';
import { UserModel } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  createUser: boolean = false;
  user: UserModel = new UserModel();

  loginSub: Subscription = new Subscription();
  createUserSub: Subscription = new Subscription();

  constructor(
    private httpClient: HttpClient,
    private cookies: CookieService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.loginSub ? this.loginSub.unsubscribe() : null;
    this.createUserSub ? this.createUserSub.unsubscribe() : null;
  }

  toggleCreateUser() {
    this.createUser = !this.createUser;
  }

  handleCreateUser() {
    this.createUserSub = this.httpClient
      .post('http://localhost:8080/user/save', this.user)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.cookies.set('userSession', JSON.stringify(data));
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  login() {
    this.router.navigate(['/home']);
    this.loginSub = this.httpClient
      .post('http://localhost:8080/user/login', this.user)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.cookies.set('userSession', JSON.stringify(data));
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
}

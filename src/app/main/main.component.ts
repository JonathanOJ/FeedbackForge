import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserModel } from '../models/user.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  userSession: UserModel = new UserModel();
  pageInUse: string = '';

  constructor(private cookies: CookieService, private router: Router) {}

  ngOnInit(): void {
    // if (!this.cookies.check('userSession')) {
    //   this.router.navigate(['/login']);
    // } else {
    //   this.userSession = JSON.parse(this.cookies.get('userSession'));
    //   this.userSession.role == 'admin';
    // }
    this.userSession.role = 'admin';
    this.userSession.name = 'admin';
    this.setPageInUse(this.userSession.role);
  }

  setPageInUse(role: string): void {
    switch (role) {
      case 'admin':
        this.pageInUse = 'articles';
        break;
      case 'user':
        this.pageInUse = 'articles';
        break;
      case 'evaluator':
        this.pageInUse = 'avaliations';
        break;
      default:
        this.pageInUse = 'articles';
        break;
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './services/api.service';

export const servidor = 'http://localhost:8080';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'FeedbackForge';

  apiService = inject(ApiService);

  constructor(private cookies: CookieService, private router: Router) {}

  ngOnInit(): void {
    if (!this.cookies.check('userSession')) {
      this.router.navigate(['/login']);
    }

    if (this.cookies.check('token')) {
      const token = this.cookies.get('token');

      this.apiService.setHeaders(token);
    }
  }
}

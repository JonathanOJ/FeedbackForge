import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const token =
  'Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJ5IiwiZXhwIjoxNzE3MDMxNDA3fQ.3CI8jChoNA9GQQ5ppbDocZreaCWFliiLSU_UbNf0Rke8gdTkqGaE8-kBVz1eic64';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'FeedbackForge';

  constructor(private cookies: CookieService, private router: Router) {}

  ngOnInit(): void {
    if (!this.cookies.check('userSession')) {
      this.router.navigate(['/login']);
    }
  }
}

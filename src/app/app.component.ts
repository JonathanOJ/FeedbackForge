import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() userSession: UserModel = new UserModel();
  @Output() changePage: EventEmitter<string> = new EventEmitter<string>();

  constructor(private router: Router, private cookies: CookieService) {}

  logout(): void {
    this.cookies.delete('userSession');
    this.router.navigate(['/login']);
  }

  openPage(page: string): void {
    this.changePage.emit(page);
  }
}

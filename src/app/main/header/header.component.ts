import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() userSession: UserModel = new UserModel();
  @Output() changePage: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}

  logout(): void {
    // this.cookies.delete('userSession');
    // this.router.navigate(['/login']);
  }

  openPage(page: string): void {
    this.changePage.emit(page);
  }
}

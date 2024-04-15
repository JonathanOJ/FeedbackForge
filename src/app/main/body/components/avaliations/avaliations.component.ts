import { Component, Input } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'avaliations',
  templateUrl: './avaliations.component.html',
  styleUrls: ['./avaliations.component.scss'],
})
export class AvaliationsComponent {
  @Input() userSession: UserModel = new UserModel();
}

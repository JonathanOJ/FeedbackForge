import { UserModel } from './user.model';

export class Article {
  id: number = 0;
  title: string = '';
  resume: string = '';
  link: string = '';
  date: Date = new Date();
  authors: String = '';
  nota: number = 0;
  status: string = 'Draft';
  avaliated: boolean = false;
  user: UserModel = new UserModel();
}

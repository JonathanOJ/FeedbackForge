import { Author } from './author.model';
import { AvaliationModel } from './avaliation.model';
import { UserModel } from './user.model';

export class Article {
  id: number = 0;
  title: string = '';
  resume: string = '';
  link: string = '';
  date: Date = new Date();
  authors: String = '';
  evaluators: AvaliationModel[] = [];
  nota: number = 0;
  status: string = 'Draft';
  user: UserModel = new UserModel();
}

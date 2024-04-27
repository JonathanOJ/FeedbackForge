import { Article } from './article.model';
import { UserModel } from './user.model';

export class AvaliationModel {
  id: number = 0;
  user: UserModel = new UserModel();
  article: Article = new Article();
  nota: number = 0;
  avaliated: boolean = false;
}

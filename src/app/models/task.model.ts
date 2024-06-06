import { UserModel } from './user.model';

export class TaskModel {
  id: number = 0;
  title: string = '';
  description: string = '';
  itens: string = '';
  status: 'Concluída' | 'Pendente' = 'Pendente';
  user: UserModel = new UserModel();
}

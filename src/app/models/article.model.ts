import { Author } from './author.model';

export class Article {
  id: number = 0;
  title: string = '';
  resume: string = '';
  link: string = '';
  date: Date = new Date();
  authors: Author[] = [
    {
      name: '',
    },
  ];
  status: string = '';
}

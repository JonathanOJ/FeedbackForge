import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Article } from 'src/app/models/article.model';
import { Author } from 'src/app/models/author.model';
import { UserModel } from 'src/app/models/user.model';

export class Rate {
  N1: number = 0;
  N2: number = 0;
  media: number = 0;
  evaluationId: number = 0;
}
@Component({
  selector: 'avaliations',
  templateUrl: './avaliations.component.html',
  styleUrls: ['./avaliations.component.scss'],
})
export class AvaliationsComponent implements AfterViewInit, OnInit {
  @Input() userSession: UserModel = new UserModel();

  displayedColumns: string[] = [
    'title',
    'authors',
    'resume',
    'link',
    'date',
    'options',
  ];

  articleSelected: Article = new Article();
  rate: Rate = new Rate();
  rateArticle: boolean = false;
  dataSource: MatTableDataSource<Article> = new MatTableDataSource<Article>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {
    const fakeArticles: Article[] = [
      {
        id: 1,
        title: 'Fake Title 1',
        authors: [{ name: 'John Doe' }, { name: 'Jane Doe' }],
        resume:
          'Lorem ipsum dolor sit amet consectetur adipiscing elit. Nulla vitae nunc nec odio ultricies tincidunt. Lorem ipsum dolor sit amet consectetur adipiscing elit. Nulla vitae nunc nec odio ultricies tincidunt.',
        status: 'Published',
        link: 'https://www.google.com',
        evaluators: [],
        date: new Date(),
        nota: 0,
      },
      {
        id: 2,
        title: 'Fake Title 2',
        authors: [{ name: 'Jane Doe' }],
        resume: 'Dolor sit amet...',
        status: 'Recused',
        link: 'https://www.google.com/aloha',
        evaluators: [],
        date: new Date(),
        nota: 0,
      },
      {
        id: 3,
        title: 'Fake Title 3',
        authors: [{ name: 'John Doe' }],
        resume: 'Sit amet consectetur...',
        status: 'Pending',
        link: 'https://www.google.com/ola',
        date: new Date(),
        evaluators: [],
        nota: 0,
      },
      {
        id: 4,
        title: 'Fake Title 4',
        authors: [{ name: 'Antonio' }],
        resume: 'Sit amet consectetur...',
        status: 'Draft',
        link: 'https://www.google.com/ola',
        date: new Date(),
        evaluators: [],
        nota: 0,
      },
    ];

    this.dataSource = new MatTableDataSource<Article>(fakeArticles);
  }

  ngOnInit(): void {
    this.getArticlesToAvaliate();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
  }

  getArticlesToAvaliate() {
    this.http
      .get(
        `http://localhost:8080/evaluation/findAllById/${this.userSession.id}`
      )
      .subscribe({
        next: (data: any) => {
          console.log(data);
          const articles: Article[] = data;
          this.dataSource = new MatTableDataSource<Article>(articles);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  concacAuthors(authors: Author[]) {
    return authors.map((author) => author.name).join(', ');
  }

  saveRate(article: Article) {
    if (this.rate.N1 > 10 || this.rate.N1 < 0) {
      return this.openSnackBar('N1 tem que estar entre 0 e 10!');
    }
    if (this.rate.N2 > 10 || this.rate.N2 < 0) {
      return this.openSnackBar('N2 tem que estar entre 0 e 10!');
    }

    this.rate.media = this.rate.N1 * this.rate.N2;
    this.rate.evaluationId = article.id;
    // salva a avaliação
    // this.http.post('http://localhost:3000/evaluation/saveRate', rate).subscribe({
    //       next: (data: any) => {
    //         console.log(data);
    //       },
    //       error: (error: any) => {
    //         console.log(error);
    //       },
    //     });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Fechar');
  }
}

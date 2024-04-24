import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Article } from 'src/app/models/article.model';
import { UserModel } from 'src/app/models/user.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { Author } from 'src/app/models/author.model';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EvaluationModalComponent } from './evaluation-modal/evaluation-modal.component';
import { AvaliationModel } from 'src/app/models/avaliation.model';

export interface DialogData {
  evaluators: UserModel[];
}
@Component({
  selector: 'articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
})
export class ArticlesComponent implements OnInit, OnDestroy {
  @Input() userSession: UserModel = new UserModel();

  createArticle: boolean = false;
  article: Article = new Article();
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  getArticlesSub: Subscription = new Subscription();

  displayedColumns: string[] = [
    'title',
    'authors',
    'resume',
    'link',
    'date',
    'status',
    'options',
  ];
  dataSource: MatTableDataSource<Article> = new MatTableDataSource<Article>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  constructor(private http: HttpClient, public dialog: MatDialog) {
    const fakeArticles: Article[] = [
      {
        id: 1,
        title: 'Fake Title 1',
        authors: [{ name: 'John Doe' }, { name: 'Jane Doe' }],
        resume:
          'Lorem ipsum dolor sit amet consectetur adipiscing elit. Nulla vitae nunc nec odio ultricies tincidunt. Lorem ipsum dolor sit amet consectetur adipiscing elit. Nulla vitae nunc nec odio ultricies tincidunt.',
        status: 'Published',
        link: 'https://www.google.com',
        date: new Date(),
        evaluators: [],
        nota: 0,
      },
      {
        id: 2,
        title: 'Fake Title 2',
        authors: [{ name: 'Jane Doe' }],
        resume: 'Dolor sit amet...',
        status: 'Recused',
        link: 'https://www.google.com/aloha',
        date: new Date(),
        evaluators: [],
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
      // Add more fake articles as needed
    ];

    // Assign the fake data to the dataSource
    this.dataSource = new MatTableDataSource<Article>(fakeArticles);
  }

  ngOnInit(): void {
    this.getArticles(this.userSession);
  }

  ngOnDestroy(): void {
    this.getArticlesSub ? this.getArticlesSub.unsubscribe() : null;
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
  }

  getArticles(user: UserModel): void {
    const path: string =
      user.role == 'admin' ? 'findAll' : `findAllById/${user.id}`;

    this.getArticlesSub = this.http
      .get(`http://localhost:8080/articles/${path}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.dataSource = new MatTableDataSource<Article>(data);
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

  createNewArticle() {
    this.createArticle = true;
    this.article = new Article();
  }

  saveArticle(article: Article) {
    this.getArticlesSub = this.http
      .get('http://localhost:8080/articles/save')
      .subscribe({
        next: (data: any) => {
          this.dataSource.data.push(article);
          this.dataSource._updateChangeSubscription();
        },
        error: (error: any) => {
          console.log(error);
        },
      });
    this.article = new Article();
    this.createArticle = false;
  }

  onEdit(article: Article) {
    this.article = article;
    this.createArticle = true;
  }

  onDelete(article: Article) {
    this.http.delete(`http://localhost:8080/articles/${article.id}`).subscribe({
      next: (data: any) => {
        const index = this.dataSource.data.push(article);
        if (index >= 0) {
          this.dataSource.data.splice(index, 1);
        }
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  getColorStatus(status: string) {
    switch (status) {
      case 'Published':
        return 'green';
      case 'Recused':
        return 'red';
      case 'Pending':
        return 'orange';
      default:
        return 'gray';
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      if (this.article.authors.length == 5) {
        return;
      }
      this.article.authors.push({ name: value });
    }

    event.chipInput!.clear();
  }

  remove(author: Author): void {
    const index = this.article.authors.indexOf(author);

    if (index >= 0) {
      this.article.authors.splice(index, 1);
    }
  }

  edit(author: Author, event: MatChipEditedEvent) {
    const value = event.value.trim();

    if (!value) {
      this.remove(author);
      return;
    }

    // Edit existing fruit
    const index = this.article.authors.indexOf(author);
    if (index >= 0) {
      this.article.authors[index].name = value;
    }
  }

  concacAuthors(authors: Author[]) {
    return authors.map((author) => author.name).join(', ');
  }

  openDialog(articleSelected: Article): void {
    this.article = articleSelected;
    const dialogRef = this.dialog.open(EvaluationModalComponent, {
      data: {
        evaluators: [],
      } as DialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.handleEvaluation(result);
    });
  }

  handleEvaluation(users: UserModel[]) {
    users.forEach((user) => {
      let avaliation: AvaliationModel = new AvaliationModel();
      avaliation.user_id = user.id;
      avaliation.article_id = this.article.id;
      this.article.evaluators.push(avaliation);
    });
    console.log(this.article);
    this.article.status = 'Pending';
    this.sendEvaluation(this.article);
  }

  sendEvaluation(article: Article) {
    this.http
      .post('http://localhost:8080/articles/sendToEvaluation', article)
      .subscribe({
        next: (data: any) => {
          this.getArticles(this.userSession);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
}

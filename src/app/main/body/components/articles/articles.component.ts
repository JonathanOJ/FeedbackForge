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
  articleAuthors: Author[] = [];
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

  constructor(private http: HttpClient, public dialog: MatDialog) {}

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
      .get(`http://localhost:8080/article/${path}`)
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
    article.authors = this.concacAuthors(this.articleAuthors);
    article.user = this.userSession;
    this.getArticlesSub = this.http
      .post('http://localhost:8080/article/save', article)
      .subscribe({
        next: (data: any) => {
          this.dataSource.data.push(data);
          this.dataSource._updateChangeSubscription();
          this.createArticle = false;
          this.article = new Article();
          this.articleAuthors = [];
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  onEdit(article: Article) {
    this.article = article;
    console.log(this.article);
    this.createArticle = true;
  }

  onDelete(article: Article) {
    this.http.delete(`http://localhost:8080/article/${article.id}`).subscribe({
      next: (data: any) => {
        const index = this.dataSource.data.indexOf(article);
        this.dataSource.data.splice(index, 1);
        this.dataSource._updateChangeSubscription();
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
      this.articleAuthors.push({ name: value });
    }

    event.chipInput!.clear();
  }

  remove(author: Author): void {
    const index = this.articleAuthors.indexOf(author);

    if (index >= 0) {
      this.articleAuthors.splice(index, 1);
    }
  }

  edit(author: Author, event: MatChipEditedEvent) {
    const value = event.value.trim();

    if (!value) {
      this.remove(author);
      return;
    }

    // Edit existing fruit
    const index = this.articleAuthors.indexOf(author);
    if (index >= 0) {
      this.articleAuthors[index].name = value;
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
      .post('http://localhost:8080/article/sendToEvaluation', article)
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

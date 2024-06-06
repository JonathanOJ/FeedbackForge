import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Article } from 'src/app/models/article.model';
import { UserModel } from 'src/app/models/user.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { Author } from 'src/app/models/author.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EvaluationModalComponent } from './evaluation-modal/evaluation-modal.component';
import { AvaliationModel } from 'src/app/models/avaliation.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { token } from 'src/app/app.component';

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
  headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: token,
  });

  getArticlesSub: Subscription = new Subscription();

  displayedColumns: string[] = [
    'title',
    'authors',
    'resume',
    'link',
    'date',
    'nota',
    'status',
    'options',
  ];
  dataSource: MatTableDataSource<Article> = new MatTableDataSource<Article>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getArticles(this.userSession);
  }

  ngOnDestroy(): void {
    this.getArticlesSub ? this.getArticlesSub.unsubscribe() : null;
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.pageSize = 10;
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
  }

  getArticles(user: UserModel): void {
    this.getArticlesSub = this.http
      .get(`http://localhost:8080/article/findAll/${user.id}`, {
        headers: this.headers,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource.data = data;
          this.dataSource._updateChangeSubscription();
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

  handleArticle(article: Article) {
    article.authors = this.concacAuthors(this.articleAuthors);
    article.id ? this.updateArticle(article) : this.saveArticle(article);
  }

  updateArticle(article: Article) {
    if (this.validateArticle(article)) return;
    this.getArticlesSub = this.http
      .post('http://localhost:8080/article/update', article, {
        headers: this.headers,
      })
      .subscribe({
        next: (data: any) => {
          const index = this.dataSource.data.indexOf(article);
          this.dataSource.data[index] = data;
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

  saveArticle(article: Article) {
    article.user = this.userSession;
    if (this.validateArticle(article)) return;
    this.getArticlesSub = this.http
      .post('http://localhost:8080/article/save', article, {
        headers: this.headers,
      })
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

  validateArticle(article: Article): boolean {
    let invalid: boolean = false;
    if (!article.title) {
      this.openSnackBar('Título é obrigatório');
      return (invalid = true);
    }
    if (!article.link) {
      this.openSnackBar('Link é obrigatório');
      return (invalid = true);
    }
    if (!article.authors) {
      this.openSnackBar('Autores é obrigatório');
      return (invalid = true);
    }
    if (!article.resume) {
      this.openSnackBar('Resumo é obrigatório');
      return (invalid = true);
    }
    return invalid;
  }

  onEdit(article: Article) {
    this.article = article;
    this.articleAuthors = article.authors
      .split(',')
      .map((author) => ({ name: author }));
    this.createArticle = true;
  }

  onDelete(article: Article) {
    this.http
      .delete(`http://localhost:8080/article/${article.id}`, {
        headers: this.headers,
      })
      .subscribe({
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
      if (this.articleAuthors.length == 5) {
        this.openSnackBar('Limite de autores atingido');
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

      avaliation.user = user;
      avaliation.article = this.article;

      this.sendEvaluation(avaliation);
    });
    this.article.status = 'Pending';
    this.updateArticle(this.article);
  }

  sendEvaluation(avaliation: AvaliationModel) {
    this.http
      .post('http://localhost:8080/avaliation/save', avaliation, {
        headers: this.headers,
      })
      .subscribe({
        next: (data: any) => {},
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Fechar');
  }

  cancel() {
    this.createArticle = false;
    this.article = new Article();
    this.articleAuthors = [];
  }
}

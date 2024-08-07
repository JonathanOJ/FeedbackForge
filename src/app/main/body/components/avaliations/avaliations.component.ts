import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Article } from 'src/app/models/article.model';
import { AvaliationModel } from 'src/app/models/avaliation.model';
import { UserModel } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api.service';

export class Rate {
  N1: number = 0;
  N2: number = 0;
  media: number = 0;
}
@Component({
  selector: 'avaliations',
  templateUrl: './avaliations.component.html',
  styleUrls: ['./avaliations.component.scss'],
})
export class AvaliationsComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() userSession: UserModel = new UserModel();

  displayedColumns: string[] = [
    'title',
    'authors',
    'resume',
    'link',
    'date',
    'nota',
    'avaliated',
    'options',
  ];

  articleSelected: Article = new Article();
  rate: Rate = new Rate();
  rateArticle: boolean = false;
  avaliations: AvaliationModel[] = [];
  dataSource: MatTableDataSource<Article> = new MatTableDataSource<Article>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  private apiService = inject(ApiService);

  getArticlesToAvaliateSub: Subscription = new Subscription();
  saveRateSub: Subscription = new Subscription();

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {}

  ngOnInit(): void {
    this.getArticlesToAvaliate();
  }

  ngOnDestroy(): void {
    this.getArticlesToAvaliateSub
      ? this.getArticlesToAvaliateSub.unsubscribe()
      : null;
    this.saveRateSub ? this.saveRateSub.unsubscribe() : null;
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.pageSize = 10;
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
  }

  getArticlesToAvaliate() {
    this.getArticlesToAvaliateSub = this.apiService
      .getAvaliationByUserId(this.userSession.id)
      .subscribe({
        next: (data: any) => {
          this.avaliations = data;
          let articles: Article[] = this.avaliations.map((avaliation) => {
            avaliation.article.avaliated = avaliation.avaliated;
            avaliation.article.nota = avaliation.nota;
            return avaliation.article;
          });

          this.dataSource.data = articles;
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

  saveRate(article: Article) {
    if (this.rate.N1 > 10 || this.rate.N1 < 0) {
      return this.openSnackBar('Relevância tem que estar entre 0 e 10!');
    }
    if (this.rate.N2 > 10 || this.rate.N2 < 0) {
      return this.openSnackBar('Experiência tem que estar entre 0 e 10!');
    }

    this.rate.media = this.rate.N1 * this.rate.N2;

    let avaliation = this.avaliations.find(
      (avaliation) => avaliation.article.id == article.id
    );

    if (avaliation) {
      avaliation.nota > 0
        ? (avaliation.nota += this.rate.media)
        : (avaliation.nota = this.rate.media);
    }
    this.saveRateSub = this.apiService.saveRate(avaliation).subscribe({
      next: (data: any) => {
        this.rateArticle = false;
        this.getArticlesToAvaliate();
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Fechar');
  }
}

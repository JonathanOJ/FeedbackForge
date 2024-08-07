import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
// import { token } from 'src/app/app.component';
import { Article } from 'src/app/models/article.model';
import { UserModel } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss'],
})
export class PublishComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() userSession: UserModel = new UserModel();

  articleSelected: Article = new Article();

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

  apiService = inject(ApiService);

  getArticlesToPublishSub: Subscription = new Subscription();
  handleArticleSub: Subscription = new Subscription();
  constructor() {}

  ngOnInit(): void {
    this.getArticlesToPublish();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.pageSize = 10;
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.getArticlesToPublishSub
      ? this.getArticlesToPublishSub.unsubscribe()
      : null;
    this.handleArticleSub ? this.handleArticleSub.unsubscribe() : null;
  }

  getArticlesToPublish() {
    this.getArticlesToPublishSub = this.apiService
      .getArticlesToPublish()
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

  handleArticle(article: Article, order: string) {
    article.status = order;
    this.handleArticleSub = this.apiService.saveArticle(article).subscribe({
      next: (data: any) => {},
      error: (error: any) => {},
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
}

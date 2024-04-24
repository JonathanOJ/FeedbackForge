import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Article } from 'src/app/models/article.model';
import { Author } from 'src/app/models/author.model';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss'],
})
export class PublishComponent implements OnInit {
  @Input() userSession: UserModel = new UserModel();

  articleSelected: Article = new Article();

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getArticlesToPublish();
  }

  getArticlesToPublish() {
    this.http.get('https://localhost:5001/api/publish/findAll').subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  publishArticle() {
    this.articleSelected.status = 'Published';
    this.http
      .post('https://localhost:5001/api/publish/save', this.articleSelected)
      .subscribe({
        next: (data: any) => {
          console.log(data);
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

  concacAuthors(authors: Author[]) {
    return authors.map((author) => author.name).join(', ');
  }
}

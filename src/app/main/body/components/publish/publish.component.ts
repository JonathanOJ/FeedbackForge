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

  constructor(private http: HttpClient) {
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
      // Add more fake articles as needed
    ];

    // Assign the fake data to the dataSource
    this.dataSource = new MatTableDataSource<Article>(fakeArticles);
  }

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

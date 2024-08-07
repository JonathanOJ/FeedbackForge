import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { servidor } from '../app.component';
import { Article } from '../models/article.model';
import { AvaliationModel } from '../models/avaliation.model';
import { TaskModel } from '../models/task.model';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) {}

  setHeaders(token: string) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: token,
    });
  }

  getHeaders() {
    return this.headers;
  }

  getArticles(userId: Number) {
    return this.http.get(`${servidor}/article/findAll/${userId}`, {
      headers: this.headers,
    });
  }

  updateArticle(article: Article) {
    return this.http.post(`${servidor}/article/update`, article, {
      headers: this.headers,
    });
  }

  saveArticle(article: Article) {
    return this.http.post(`${servidor}/article/save`, article, {
      headers: this.headers,
    });
  }

  deleteArticle(articleId: Number) {
    return this.http.delete(`${servidor}/article/${articleId}`, {
      headers: this.headers,
    });
  }

  saveAvaliation(avaliation: AvaliationModel) {
    return this.http.post(`${servidor}/avaliation/save`, avaliation, {
      headers: this.headers,
    });
  }

  getEvaluators() {
    return this.http.get(`${servidor}user/findAllByRole/evaluator`, {
      headers: this.headers,
    });
  }

  getUsers() {
    return this.http.get(`${servidor}/user/findAll`, {
      headers: this.headers,
    });
  }

  updateUser(user: UserModel) {
    return this.http.post(`${servidor}/user/update`, user, {
      headers: this.headers,
    });
  }

  saveUser(user: UserModel) {
    return this.http.post(`${servidor}/user/save`, user, {
      headers: this.headers,
    });
  }

  deleteUser(userId: Number) {
    return this.http.delete(`${servidor}/user/${userId}`, {
      headers: this.headers,
    });
  }

  updateTask(task: TaskModel) {
    return this.http.post(`${servidor}/task/update`, task, {
      headers: this.headers,
    });
  }

  saveTask(task: TaskModel) {
    return this.http.post(`${servidor}/task/save`, task, {
      headers: this.headers,
    });
  }

  deleteTask(taskId: Number) {
    return this.http.delete(`${servidor}/task/${taskId}`, {
      headers: this.headers,
    });
  }

  getTasksByUser(userId: Number) {
    return this.http.get(`${servidor}/task/findAll/${userId}`, {
      headers: this.headers,
    });
  }

  getAvaliationByUserId(userId: Number) {
    return this.http.get(`${servidor}/avaliation/findAllByUserId/${userId}`, {
      headers: this.headers,
    });
  }

  saveRate(rate: any) {
    return this.http.post(`${servidor}/avaliation/saveRate`, rate, {
      headers: this.headers,
    });
  }

  getArticlesToPublish() {
    return this.http.get(`${servidor}/article/findAllToPublish`, {
      headers: this.headers,
    });
  }
}

import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../articles.component';
import { UserModel } from 'src/app/models/user.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-evaluation-modal',
  templateUrl: './evaluation-modal.component.html',
  styleUrls: ['./evaluation-modal.component.scss'],
})
export class EvaluationModalComponent implements OnInit, OnDestroy {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  evaluatorCtrl = new FormControl('');
  filteredEvaluators: Observable<UserModel[]>;
  evaluators: UserModel[] = [];
  allEvaluator: UserModel[] = [];

  getEvaluatorsSub: Subscription = new Subscription();

  @ViewChild('evaluatorInput') evaluatorInput!: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<EvaluationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient
  ) {
    this.filteredEvaluators = this.evaluatorCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) =>
        value !== null ? this._filter(value) : this.allEvaluator.slice()
      )
    );
  }

  ngOnInit(): void {
    this.getAvaluators();
  }

  ngOnDestroy(): void {
    this.getEvaluatorsSub ? this.getEvaluatorsSub.unsubscribe() : null;
  }

  getAvaluators() {
    this.allEvaluator = [
      {
        id: 1,
        username: 'John Doe',
        email: 'jona@gmail.com',
        role: 'Evaluator',
        password: '123456',
      },
      {
        id: 2,
        username: 'Jane Doe',
        email: 'gmail.com',
        role: 'Evaluator',
        password: '123456',
      },
      {
        id: 3,
        username: 'John Smith',
        email: 'ksjakj@gmai..con',
        role: 'Evaluator',
        password: '123456',
      },
    ];

    // this.http.get('http://localhost:3000/evaluation').subscribe({
    //       next: (data: any) => {
    //         console.log(data);
    //          rateArticle = false
    //       },
    //       error: (error: any) => {
    //         console.log(error);
    //       },
    //     });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add the selected evaluator to the evaluators array
    const selectedEvaluator = this.allEvaluator.find(
      (evaluator) => evaluator.username === value
    );
    console.log(this.evaluators);
    if (selectedEvaluator && this.evaluators.length < 3) {
      this.evaluators.push(selectedEvaluator);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.evaluatorCtrl.setValue('');
  }

  remove(evaluator: UserModel): void {
    const index = this.evaluators.indexOf(evaluator);
    if (index >= 0) {
      this.evaluators.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedEvaluator = this.allEvaluator.find(
      (evaluator) => evaluator.username === event.option.viewValue
    );
    if (selectedEvaluator) {
      const index = this.evaluators.indexOf(selectedEvaluator);
      if (index >= 0) {
        return;
      }
    }

    if (selectedEvaluator && this.evaluators.length < 3) {
      this.evaluators.push(selectedEvaluator);
    }
    console.log(this.evaluators);

    this.evaluatorInput.nativeElement.value = '';
    this.evaluatorCtrl.setValue('');
  }

  private _filter(value: string): UserModel[] {
    const filterValue = value.toLowerCase();
    return this.allEvaluator.filter((evaluator) =>
      evaluator.username.toLowerCase().includes(filterValue)
    );
  }
}

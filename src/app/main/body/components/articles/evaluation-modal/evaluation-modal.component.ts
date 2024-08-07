import {
  Component,
  ElementRef,
  inject,
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';

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

  private apiService = inject(ApiService);

  getEvaluatorsSub: Subscription = new Subscription();

  @ViewChild('evaluatorInput') evaluatorInput!: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<EvaluationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackBar: MatSnackBar
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
    this.getEvaluatorsSub = this.apiService.getEvaluators().subscribe({
      next: (data: any) => {
        this.allEvaluator = data;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    const selectedEvaluator = this.allEvaluator.find(
      (evaluator) => evaluator.username === value
    );
    if (selectedEvaluator && this.evaluators.length < 3) {
      this.evaluators.push(selectedEvaluator);
    } else {
      this.openSnackBar('Apenas 3 avaliadores podem ser adicionados');
    }

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

    this.evaluatorInput.nativeElement.value = '';
    this.evaluatorCtrl.setValue('');
  }

  private _filter(value: string): UserModel[] {
    const filterValue = value.toLowerCase();
    return this.allEvaluator.filter((evaluator) =>
      evaluator.username.toLowerCase().includes(filterValue)
    );
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Fechar');
  }
}

import {Component, effect, EventEmitter, inject, input, output} from '@angular/core';
import {EventModel} from '../../models/event.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {EventService} from '../../services/event.service';
import {iif} from 'rxjs';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {DatePicker} from 'primeng/datepicker';
import {Select} from 'primeng/select';

@Component({
  selector: 'app-event-form',
  imports: [
    Button,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    DatePicker,
    Select
  ],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss'
})
export class EventFormComponent {
  private formBuilder = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private eventService = inject(EventService);

  onSave = output<boolean>();
  event = input.required<EventModel>();
  form = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: [''],
    startDate: [new Date(), [Validators.required]],
    endDate: [new Date(), [Validators.required]],
    type: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      if(!this.event()) {
        return;
      }
      this.form.patchValue({
        ...this.event(),
        startDate: new Date(this.event().startDate),
        endDate: new Date(this.event().endDate ?? this.event().startDate),
      })
    })
  }

  save() {
    if(this.form.invalid) {
      return;
    }
    iif(
      () => !this.event().id,
      this.eventService.add(this.form.value),
      this.eventService.update(this.event().id, this.form.value),
    ).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Event saved'});
        this.onSave.emit(true);
        this.form.reset();
      },
      error: () => {
        this.messageService.add({severity: 'error', summary: 'Error saving event'});
      }
    })
  }

  delete() {
    this.confirmationService.confirm({
      header: 'Êtes-vous sûr de vouloir supprimer cet événement ?',
      accept: () => {
        this.eventService.delete(this.event().id).subscribe({
          next: () => {
            this.messageService.add({severity: 'success', summary: 'Event deleted'});
            this.onSave.emit(true);
            this.form.reset();
          },
          error: () => {
            this.messageService.add({severity: 'error', summary: 'Error deleting event'});
          }
        })
      }
    })
  }
}

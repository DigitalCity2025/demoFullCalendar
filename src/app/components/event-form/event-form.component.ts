import {Component, effect, inject} from '@angular/core';
import {EventModel} from '../../models/event.model';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {EventService} from '../../services/event.service';
import {iif} from 'rxjs';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {DatePicker} from 'primeng/datepicker';
import {Select} from 'primeng/select';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

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
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly eventService = inject(EventService);
  private readonly dialogConfig = inject(DynamicDialogConfig);
  private readonly dialogRef = inject(DynamicDialogRef);

  event: Partial<EventModel> = this.dialogConfig.data;
  form = this.formBuilder.group({
    title: [this.event.title, [Validators.required]],
    description: [this.event.description],
    startDate: [new Date(this.event.startDate!), [Validators.required]],
    endDate: [new Date(this.event.endDate ?? this.event.startDate!), [Validators.required]],
    type: [this.event.type, [Validators.required]],
  });

  save() {
    if(this.form.invalid) {
      return;
    }
    iif(
      () => !this.event.id,
      this.eventService.add(this.form.value),
      this.eventService.update(this.event.id!, this.form.value),
    ).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Event saved'});
        this.form.reset();
        this.dialogRef.close(true);
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
        this.eventService.delete(this.event.id!).subscribe({
          next: () => {
            this.messageService.add({severity: 'success', summary: 'Event deleted'});
            this.form.reset();
            this.dialogRef.close(true);
          },
          error: () => {
            this.messageService.add({severity: 'error', summary: 'Error deleting event'});
          }
        })
      }
    })
  }
}

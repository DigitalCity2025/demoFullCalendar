import {Component, inject} from '@angular/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timegrid';
import {Toast} from 'primeng/toast';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {DialogService} from 'primeng/dynamicdialog';
import {FullCalendarModule} from '@fullcalendar/angular';
import {EventService} from './services/event.service';
import {CalendarOptions, EventClickArg, EventInput,} from '@fullcalendar/core';
import InteractionPlugin, {DateClickArg} from '@fullcalendar/interaction';
import { EventFormComponent } from './components/event-form/event-form.component';

const BASE_DIALOG_OTIONS = {
  style: { width: '50rem' },
  breakpoints: { '1199px': '75vw', '575px': '90vw' },
  maximizable: true,
  modal: true,
  closable: true,
}
@Component({
  selector: 'app-root',
  imports: [Toast, ConfirmDialog, FullCalendarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly eventService = inject(EventService);
  private readonly dialogService = inject(DialogService);

  options: CalendarOptions & { schedulerLicenseKey: string } = {
    plugins: [resourceTimelinePlugin, InteractionPlugin],
    eventClick: (e) => this.eventClickHandler(e),
    dateClick: (e) => this.dateClickHandler(e),
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
  }

  events!: EventInput[];

  constructor() {
    this.loadEvents()
  }

  onSave(result: boolean) {
    if(result) {
      this.loadEvents();
    }
  }

  private loadEvents() {
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events = data.map(e => ({
          id: e.id,
          title: e.title,
          start: new Date(e.startDate),
          end: new Date(e.endDate),
          color: this.getColor(e.type),
          extendedProps: {
            description: e.description,
            type: e.type
          }
        }));
      }
    })
  }

  private getColor(type: string) {
    switch (type) {
      case 'Category 1':
        return '#1f77b4';
      case 'Category 2':
        return '#ff7f0e';
      case 'Category 3':
        return '#2ca02c';
      default:
        return '#d62728';
    }
  }

  private eventClickHandler(e: EventClickArg) {
    const event = {
      id: e.event.id,
      title: e.event.title,
      description: e.event.extendedProps['description'],
      startDate: e.event.start,
      endDate: e.event.end,
      type: e.event.extendedProps['type'],
    };
    this.dialogService.open(EventFormComponent, {
      ...BASE_DIALOG_OTIONS,
      data: event,
      header: 'Modifier un événement'
    }).onClose.subscribe((response) => { if(response) this.loadEvents(); });
  }

  private dateClickHandler(e: DateClickArg) {
    const event = {
      startDate: e.date.toISOString(),
    };
    this.dialogService.open(EventFormComponent, {
      ...BASE_DIALOG_OTIONS,
      data: event,
      header: 'Ajouter un événement'
    }).onClose.subscribe((response) => { if(response) this.loadEvents(); });;
  }
}

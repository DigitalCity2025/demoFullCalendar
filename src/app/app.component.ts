import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Toast} from 'primeng/toast';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {FullCalendarModule} from '@fullcalendar/angular';
import {EventService} from './services/event.service';
import {CalendarOptions, EventClickArg, EventInput,} from '@fullcalendar/core';
import DayGridPlugin from '@fullcalendar/daygrid';
import InteractionPlugin, {DateClickArg} from '@fullcalendar/interaction';
import {Dialog} from 'primeng/dialog';
import {EventFormComponent} from './components/event-form/event-form.component';

@Component({
  selector: 'app-root',
  imports: [Toast, ConfirmDialog, FullCalendarModule, Dialog, EventFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private eventService = inject(EventService);
  popupVisible: boolean = false;
  event: any;

  options: CalendarOptions = {
    plugins: [DayGridPlugin, InteractionPlugin],
    eventClick: (e) => this.eventClickHandler(e),
    dateClick: (e) => this.dateClickHandler(e),
  }

  events!: EventInput[];

  constructor() {
    this.loadEvents()
  }

  onSave(result: boolean) {
    this.popupVisible = false;
    this.event = null;
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
          extendedProps: {
            description: e.description,
            type: e.type
          }
        }));
      }
    })
  }

  private eventClickHandler(e: EventClickArg) {
    this.event = {
      id: e.event.id,
      title: e.event.title,
      description: e.event.extendedProps['description'],
      startDate: e.event.start,
      endDate: e.event.end,
      type: e.event.extendedProps['type'],
    };
    this.popupVisible = true;
  }

  private dateClickHandler(e: DateClickArg) {
    this.event = {
      startDate: e.date.toISOString(),
    };
    this.popupVisible = true;
  }


  onClose() {
    console.log(42)
    this.popupVisible = false;
    this.event = null;
  }
}

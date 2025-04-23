import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {EventModel} from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private httpClient = inject(HttpClient);

  getAll() {
    return this.httpClient.get<EventModel[]>('http://localhost:3000/events');
  }

  add(event: any) {
    return this.httpClient.post('http://localhost:3000/events', event);
  }

  update(id: string, event: any) {
    return this.httpClient.put(`http://localhost:3000/events/${id}`, event);
  }

  delete(id: string) {
    return this.httpClient.delete(`http://localhost:3000/events/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingstijdService extends DataService {

  constructor(
    http: HttpClient) {
    super(environment.baseUrl + '/trainingstijd', http);
  }
}

export interface TrainingstijdItem {
  Id: string;
  Code: string;
  Day: string;
  StartDate: string;
  EndDate: string;
  Trainer: string;
  Comment: string;
}


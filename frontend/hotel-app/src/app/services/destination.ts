import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) {}
  
  /**
   * Récupère le nombre d'hôtels par destination depuis l'API
   */
  getDestinationsCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/destinations`);
  }
}
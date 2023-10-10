import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/shortenUrl'; 

  constructor(private http: HttpClient) {}

  // Fetch Url Details
  getUrlDetails(urlData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}?url=${urlData}`,{});
  }
}

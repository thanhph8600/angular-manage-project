import { Injectable } from '@angular/core';
import { API_CONFIG } from '../api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from '../cookie.service';
import { LoadComponent } from '../../component/load/load.component';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = API_CONFIG.apiUrl;
  constructor(
    private http: HttpClient, 
    private cookie: CookieService,
    ) { }

  getData(table:string, option?: object): Observable<any> {
    const headers = this.getHeaders()
    return this.http.get<any>(`${this.apiUrl}${table}`, {  headers })
  }

  postData(table:string, data:object, option?: object) {
    const headers = this.getHeaders()
    return this.http.post<any>(`${this.apiUrl}${table}`, data, { headers })
  }

  patchData(table:string, data:object, option?: object) {
    const headers = this.getHeaders()
    return this.http.patch<any>(`${this.apiUrl}${table}`, data, { headers })
  }

  delete(table:string, option?: object) {
    const headers = this.getHeaders()
    return this.http.delete<any>(`${this.apiUrl}${table}`, { headers })
  }

  sendEmail(to: string, subject: string, html: string) {
    const data = { to, subject, html}
    const headers = this.getHeaders()
    return this.postData('email/send', data, {headers})
  }

  getHeaders() {
    const token = this.cookie.getCookie('token');
    return new HttpHeaders({
      authorization: 'Bearer ' + token,
    })
  }
}

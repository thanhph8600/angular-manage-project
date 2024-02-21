import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user:User[] = [];
  table: string = 'users';
  constructor(private dataService: DataService) { }

  login(value: object): Observable<any> {
    return this.dataService.postData('auth/login', value);
  }

  getPayload(): Observable<any> {
    return this.dataService.getData('auth/profile');
  }

  setUser(data:User): void {
    localStorage.setItem('userData', JSON.stringify([data]));
    this.user = [data]
  }

  getUser(): User[] {
    if(this.user.length !=0){
      return this.user
    }
    const storedData = localStorage.getItem('userData');
    if (storedData !== null) {
      const parsedData = JSON.parse(storedData);
      return parsedData
    }
    return this.user;
  }

  hasRole(expectedRole: Array<any>): boolean {
    this.user = this.getUser()
    const role = expectedRole.find(x=>{return x == this.user[0].role});
    if(!role){
      return false
    }
    return true
  }
  
  getById(id:number){
    return this.dataService.getData(`${this.table}/${id}`)
  }

  getAll() {
    return this.dataService.getData(this.table)
  }

  getAllCustomer() {
    return this.dataService.getData(`${this.table}/customer`)
  }

  getTop5Staff() {
    return this.dataService.postData(`${this.table}/top5`,{})
  }

  update(data:object,id:number){
    return this.dataService.patchData(`${this.table}/${id}`,data)
  }

  updateStatus(data:object,id:number){
    return this.dataService.patchData(`${this.table}/status/${id}`,data)
  }

  craete(data:object) {
    return this.dataService.postData(this.table,data)
  }

  uploadFile(file: any) {
    return this.dataService.uploadFile(file);
  }
}

export interface User{
  id: number,
  name: string,
  email: string,
  phone: string,
  address: string,
  thumb: string,
  role: string,
  area: string,
  status: string,
  position:string,
}
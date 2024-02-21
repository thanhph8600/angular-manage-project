import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  table = 'projects';
  constructor(private dataService: DataService) { }
  getById(id:number){
    return this.dataService.getData(`${this.table}/${id}`)
  }

  getAll() {
    return this.dataService.getData(this.table)
  }
  getRevenue(year: number) {
    return this.dataService.getData(`${this.table}/revenue/${year}`)
  }

  update(data:object,id:number){
    return this.dataService.patchData(`${this.table}/${id}`,data)
  }

  craete(data:object) {
    return this.dataService.postData(this.table,data)
  }

  delete(id: number) {
    return this.dataService.delete(`${this.table}/${id}`)
  }
}

export interface Project { 
  id: number;
  name: string;
  expense: number;
  teamSize: number;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date; 
  id_customer: number;
}
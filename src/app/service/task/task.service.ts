import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private task:Task[] = [];
  table: string = 'task';
  constructor(private dataService:DataService) { }

  createTask(data:object) {
    return this.dataService.postData(this.table,data)
  }
  getTasks() {
    return this.dataService.getData(this.table);
  }
  getTask(id:number) {
    return this.dataService.getData(`${this.table}/${id}`);
  }
  update(data:object,id:number){
    return this.dataService.patchData(`${this.table}/${id}`,data)
  }
  deleteTask(id:number) {
    return this.dataService.delete(`${this.table}/${id}`);
  }
}

export interface Task {
  id: number;
  id_project: number;
  id_account: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  finishDate:Date;
  note: string;
  status: string;
}
import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  table = 'team';
  constructor(private dataService: DataService) { }
  getById(id:number){
    return this.dataService.getData(`${this.table}/${id}`)
  }

  getAll() {
    return this.dataService.getData(this.table)
  }

  update(data:object,id:number){
    console.log(data,id);
    
    return this.dataService.patchData(`${this.table}/${id}`,data)
  }

  craete(data:object) {
    return this.dataService.postData(this.table,data)
  }

  getByIdProject(id:number){
    return this.dataService.getData(`${this.table}/project/${id}`)
  }

  getByIdAccount(id:number){
    return this.dataService.getData(`${this.table}/account/${id}`)
  }

  delete(id:number) {
    return this.dataService.delete(`${this.table}/${id}`)
  }
}

export interface Team {
  id: number;
  id_project: number;
  id_account: number;
  role: string;
}
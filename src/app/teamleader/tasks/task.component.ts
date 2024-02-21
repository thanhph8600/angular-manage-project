import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Route } from '@angular/router';
import { Task, TaskService } from '../../service/task/task.service';
import { DatePipe } from '@angular/common';
import { User, UserService } from '../../service/user/user.service';
import { ProjectService } from '../../service/project/project.service';
import { TeamService } from '../../service/team/team.service';
declare var $: any;
@Component({
  selector: 'app-task',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor, NgClass],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
  providers: [DatePipe]
})
export class TaskComponent implements OnInit{
  formTask = new FormGroup({
    id_project: new FormControl('', Validators.required),
    id_account: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    endDate: new FormControl('', [Validators.required, futureDateValidator]),
    status: new FormControl('pending', Validators.required),
  });
  formNote = new FormGroup({
    note: new FormControl('', Validators.required),
  });
  popup = false;
  popupNote = false;
  valueNote = '';
  isEdit = 0;
  listTask: Task[] = [];
  listPending: Task[] = [];
  listDoing: Task[] = [];
  listDone: Task[] = [];
  listFinished: Task[] = [];
  user:User[] =[]
  project:any
  role:string =''
  idAccount:number = 0
  checkStatus:boolean = false

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userService: UserService,
    private teamService: TeamService,
    private projectService: ProjectService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.getTask()
    this.route.params.subscribe(params => {
      this.getUser(params['idUser'])
      this.getPorject(params['idProject'])
      this.teamService.getByIdProject(params['idProject']).subscribe(
        (res) => {
          let checkOff = res.filter((item:any) => {
            return item.id_account == params['idUser'] && item.teamStatus == 'off'
          })
          this.checkStatus = checkOff.length ==0 ? true : false
          console.log(this.checkStatus);
          
        },
        (err) => {
          console.log(err);
        }
      );
    });
    let user =  this.userService.getUser()
    this.role = user[0].role    
  }

  getUser(id:number) {
    this.idAccount = this.userService.getUser()[0].id
    
    this.userService.getById(id).subscribe(
      (res) => {
        this.user.push(res);
      },
      (err) => {
        console.log(err);
      }
    );


  }
  getPorject(id:number) {
    this.projectService.getById(id).subscribe(
      (res) => {
        this.project = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  // This method is used to show or hide the description of the task
  ngAfterContentInit(): void {
    $(document).on('click', '.item-title', (event:any) => {
      $(event.currentTarget).next('.item-description').slideToggle();
    });
  }

  formattedDate(date:Date): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  overWorked(date:Date): boolean {
    return new Date(date) < new Date();
  }

  getValueParams() {
    this.route.params.subscribe(params => {
      this.formTask.controls['id_project'].setValue(params['idProject']);
      this.formTask.controls['id_account'].setValue(params['idUser']);
    });
  }
  getTask() {
    this.getValueParams()
    this.taskService.getTasks().subscribe(
      (res) => {
        console.log(res);
        
        if(res.length > 0){
          this.listTask = res.filter(
            (task:Task) => String(task.id_project) == this.formTask.controls['id_project'].value &&
            String(task.id_account) == this.formTask.controls['id_account'].value
          );
          this.listPending = this.listTask.filter((task:Task) => task.status == 'pending');
          this.listDoing = this.listTask.filter((task:Task) => task.status == 'doing');
          this.listDone = this.listTask.filter((task:Task) => task.status == 'done');
          this.listFinished = this.listTask.filter((task:Task) => task.status == 'finished');
        }
      },
      (err) => {
        console.log(err);
      }
    );
    
  }

  changePopup() {
    this.isEdit = 0;
    this.popup = !this.popup;
    this.formTask.reset();
    this.getValueParams()
    this.formTask.controls['status'].setValue('pending');
  }

  checkDate() {
    if(this.formTask.value.endDate) {
      const date = new Date(this.formTask.value.endDate);
      const currentDate = new Date(this.project.endDate);
      if (date < currentDate) {
        return true;
      }
    }
    return false;
  }
  onSubmit() {
    if(!this.checkDate()) {
      alert(`Không thể tạo công việc sau ngày kết thúc dự án: ${this.formattedDate(this.project.endDate)}`);
      this.formTask.get('endDate')?.hasError('invalidDate')
      return;
    }
    if(this.isEdit) {
      this.updateTask()
    }else {
      this.createTask()
    }
    
    this.changePopup()
  } 

  createTask() {
    this.taskService.createTask(this.formTask.value).subscribe(
      (res) => {
        alert('Task created successfully');
        this.getTask()
      },
      (err) => {
        alert('Error creating task');
        console.log(err);
      }
    );
  }

  updateTask() {
    const data = {
      name: this.formTask.controls['name'].value,
      description: this.formTask.controls['description'].value,
      endDate: this.formTask.controls['endDate'].value,
      status: 'pending',
    }

    this.taskService.getTask(this.isEdit).subscribe(
      (res) => {
          this.taskService.update(data, res.id).subscribe(
            (res) => {
              this.getTask()
              alert('Cập nhật công việc thành công');
            },
            (err) => {
              alert('Lỗi cập nhật công việc');
              console.log(err);
            }
          );
      },
      (err) => {
        console.log(err);
      }
    );
    
  }

  editTask(task:Task) {
    this.formTask.controls['name'].setValue(task.name);
    this.formTask.controls['description'].setValue(task.description);
    this.formTask.controls['endDate'].setValue(this.formattedDate(task.endDate));
    this.isEdit = task.id;    
    this.popup = !this.popup;
  }

  finishedStatus(task:Task) {
    this.taskService.update({status: 'finished'}, task.id).subscribe(
      (res) => {
        this.getTask()
        alert('Task finished successfully');
      },
      (err) => {
        alert('Error finishing task');
        console.log(err);
      }
    );
  }
  deleteTask(id:number) {
    this.taskService.deleteTask(id).subscribe(
      (res) => {
        this.getTask()
        this.changePopup()
        alert('Task deleted successfully');
      },
      (err) => {
        alert('Error deleting task');
        console.log(err);
      }
    );
  }
  changePopupNote() {
    this.popupNote = !this.popupNote;
    this.formNote.reset();
    this.isEdit = 0;
  }
  editNote(id:number){
    this.isEdit = id;
    this.popupNote = !this.popupNote;
  }
  onSunmitNote() {
    const data = {
      note: this.formNote.controls['note'].value,
      status: 'pending',
    }
    this.taskService.update(data, this.isEdit).subscribe(
      (res) => {
        this.getTask()
        this.changePopupNote()
        alert('Note updated successfully');
      },
      (err) => {
        alert('Error updating note');
        console.log(err);
      }
    );
  }

  updateStatusByUser(task:Task, status:string) {
    let data: { status: string, finishDate?: String } = {
      status: status,
    };
    
    if (status == 'done') {
      data.finishDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    
    this.taskService.update(data, task.id).subscribe(
      (res) => {
        this.getTask()
        alert('Task status updated successfully');
      },
      (err) => {
        alert('Error updating task status');
        console.log(err);
      }
    );
  }

}

function futureDateValidator(control: AbstractControl): { [key: string]: any } | null {
  const selectedDate: Date = new Date(control.value);
  const currentDate: Date = new Date();
  if (selectedDate < currentDate) {
    return { 'invalidDate': true };
  }
  return null;
}


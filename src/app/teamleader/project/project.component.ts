import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Project, ProjectService } from '../../service/project/project.service';
import { User, UserService } from '../../service/user/user.service';
import { LoadComponent } from '../../component/load/load.component';
import { TeamService } from '../../service/team/team.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, FormsModule, NgFor, LoadComponent],
  providers: [DatePipe],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent implements OnInit {
  projectList: Project[] = [];
  leaderList: User[] = [];
  user:User[] = [];

  popup: boolean = false;
  loadCreate: boolean = false;
  projectForm:FormGroup;
  leaeder: Leader = {
    id_account : 0,
    id_project: 0,
    role: 'leader',
  };
  constructor(
    private projectService: ProjectService, 
    private userService: UserService,
    private teamService: TeamService,
    private datePipe: DatePipe
    ) { 
    this.projectForm = new FormGroup({
      'name': new FormControl('test', Validators.required),
      'expense': new FormControl(123, Validators.required),
      'teamSize': new FormControl(12, Validators.required),
      'startDate': new FormControl(null, Validators.required),
      'endDate': new FormControl(null, Validators.required),
    },{validators: this.dateLessThan('startDate', 'endDate')});
  }

  ngOnInit(): void {
    this.user = this.userService.getUser()  
    if (this.user[0].role == 'leader') {
      this.leaeder.id_account = this.user[0].id;
    }else {
      this.userService.getAll().subscribe((res) => {
        const users = res;
        const leaders = users.filter((user: User) => {
          return user.role == 'leader' && user.status == 'activate'
        })
      this.leaderList = leaders
      })
    }

    this.projectService.getAll().subscribe((res) => {
      this.projectList = res;
    })
  }

  currentDate(date: Date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  changeLeader(event: any) { 
    this.leaeder.id_account = event.target.value;
  }
  
  changePopup() {
    this.popup = !this.popup;
    this.projectForm.reset()
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.loadCreate = true
      console.log(this.projectForm.value.createAt);
      this.projectService.craete(this.projectForm.value).subscribe((res) => {
        this.leaeder.id_project = res.id;
        
        this.teamService.craete( this.leaeder ).subscribe((res) => {  
            this.userService.update( { status: 'busy' } , this.leaeder.id_account)
              .subscribe((res) => {
                alert('Create project success')
                this.loadCreate = false
                this.changePopup();
              })
          }, (err) => {
            this.projectService.delete(this.leaeder.id_project).subscribe()
            console.log(err);
            alert('Create project fail')
            this.loadCreate = false
          })
      })
    }
  }

  dateLessThan(startKey: string, endKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let start = control.get(startKey);
      let end = control.get(endKey);
      if (start && end && start.value > end.value) {
        return {
          dates: "Start date should be less than end date"
        };
      }
      return null;
    };
  }
}

interface Leader {
  id_account: number;
  id_project: number;
  role: string;
}
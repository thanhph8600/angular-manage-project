import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Project, ProjectService } from '../../service/project/project.service';
import { User, UserService } from '../../service/user/user.service';
import { LoadComponent } from '../../component/load/load.component';
import { Team, TeamService } from '../../service/team/team.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    NgIf, 
    ReactiveFormsModule, 
    FormsModule, 
    NgFor, 
    LoadComponent,
    RouterLink
  ],
  providers: [DatePipe],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent implements OnInit {
  projectList: Project[] = [];
  filterProjectList: Project[] = [];
  leaderList: User[] = [];
  user:User[] = [];
  
  popup: boolean = false;
  loadCreate: boolean = false;
  projectForm:FormGroup;
  leader: Leader = {
    id_account : 0,
    id_project: 0,
    role: 'leader',
  };
  idTeam: number = 0;
  update: number = 0;

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

    this.getProjectList()
    this.getLeader()
  }

  getProjectList() {
    if (this.user[0].role == 'admin') {
      this.projectService.getAll().subscribe((res) => {
        this.projectList = res;
        this.filterProjectList = this.projectList;
      })
    }else {
      let project:[]
      this.teamService.getByIdAccount(this.user[0].id).subscribe((res) => {
        project = res;
  
        this.projectService.getAll().subscribe((res) => {
          this.projectList = res.filter((res: Project) => {
            return project.some((item: any) => {
              return item.id_project == res.id
            })
          })
          
          this.filterProjectList = this.projectList;
        })
      })
    }
  }

  getLeader() {
    if (this.user[0].role == 'leader') {
      this.leader.id_account = this.user[0].id;
    }else {
      this.userService.getAll().subscribe((res) => {
        const users = res;
        const leaders = users.filter((user: User) => {
          return user.role == 'leader'
        })
      this.leaderList = leaders
      })
    }
  }

  currentDate(date: Date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  countWorking() {
    return this.projectList.filter(
      (project: Project) => {
        return project.status == 'working'
      }).length
  }
  countDone() {
    return this.projectList.filter(
      (project: Project) => {
        return project.status == 'done'}
      ).length
  }
  filterProject(value: string) {
    if(value == 'all') {
      return this.filterProjectList = this.projectList;
    } else {
      this.filterProjectList = this.projectList.filter((project: Project) => {
        return project.status == value
      });
      return this.filterProjectList;
    }
  }
  changeLeader(event: any) { 
    this.leader.id_account = event.target.value;
  }
  
  changePopup() {
    this.popup = !this.popup;
    this.update = 0;
    this.projectForm.reset()
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.loadCreate = true
      
      if(!this.update) {
        this.createProject()
        return
      }
      this.updateProject()
    }
  }

  btn_editProject(project: Project) {
    this.projectForm.setValue({
      name: project.name,
      expense: project.expense,
      teamSize: project.teamSize,
      startDate: this.currentDate(project.startDate),
      endDate: this.currentDate(project.endDate)
    })
    this.leader.id_project = project.id;
    this.teamService.getByIdProject(project.id).subscribe((res) => {
      let user = res.find((x:User) => x.role == 'leader');      
      this.leader.id_account = user.id_account;    
      this.idTeam = user.id_team;
    })
    this.update = project.id;
    this.popup = true;
  }

  createProject() {
    this.projectService.craete(this.projectForm.value).subscribe((res) => {
      this.leader.id_project = res.id;
      
      this.teamService.craete( this.leader ).subscribe((res) => {  
          alert('Create project success')
          this.loadCreate = false
          this.changePopup();
          this.getProjectList()
        }, (err) => {
          this.projectService.delete(this.leader.id_project).subscribe()
          console.log(err);
          alert('Create project fail')
          this.loadCreate = false
        })
    })
  }

  updateProject() {
    this.projectService.update(this.projectForm.value, this.leader.id_project).subscribe((res) => {
      this.teamService.update(this.leader, this.idTeam).subscribe((res) => {
        alert('Update project success')
        this.loadCreate = false
        this.changePopup();
        this.getProjectList()
      }, (err) => {
        console.log(err);
        alert('Update project fail')
        this.loadCreate = false
      })
    })
  }

  deleteProject() {
    let check = confirm('Are you sure you want to delete this project?')
    if (check) {
      this.teamService.getByIdProject(this.leader.id_project).subscribe((res) => {

        res.forEach((x:any) => {
          this.teamService.delete(x.id_team).subscribe()
          this.userService.updateStatus({status: 'activate'}, x.id_account).subscribe()
        });

        this.projectService.delete(this.leader.id_project).subscribe((res) => {
          alert('Delete project success')
          this.loadCreate = false
          this.changePopup();
          this.getProjectList()
        })
      }, 
      (err) => {
        console.log(err);
        alert('Delete project fail')
        this.loadCreate = false
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
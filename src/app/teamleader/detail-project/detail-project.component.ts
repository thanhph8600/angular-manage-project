import { Component, OnInit } from '@angular/core';
import { User, UserService } from '../../service/user/user.service';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Project, ProjectService } from '../../service/project/project.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Team, TeamService } from '../../service/team/team.service';
import { TaskService } from '../../service/task/task.service';

@Component({
  selector: 'app-detail-project',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  providers: [DatePipe],
  templateUrl: './detail-project.component.html',
  styleUrl: './detail-project.component.css'
})
export class DetailProjectComponent implements OnInit {
  listStaff: User[] = [];
  teamProject: any[] = [];
  project!: Project;
  user: User[] = [];
  customer: User[] = [];
  popup = false;
  valueOutProject = {
    id: 0,
    id_account: 0,
    id_project: 0,
    id_account_change: 0,
    name: '',
    sumtask: 0,
  };
  constructor(
    private userService: UserService, 
    private projectService: ProjectService,
    private teamService: TeamService,
    private taskService: TaskService,
    private router: ActivatedRoute,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.getvalue();
    this.user = this.userService.getUser()
  }

  getvalue() {
    this.router.paramMap.subscribe((params) => {
      this.getProject(Number(params.get('id')));
      this.getTeamProject(Number(params.get('id')));
    });
    this.getStaff();
  }
  getProject(id:number) {
    this.projectService.getById(id).subscribe((data) => {
      this.project = data;
      this.userService.getById(data.id_customer).subscribe((data) => {
        this.customer.push(data);
      });
    });
  }
  getTeamProject(id:number) {
    this.teamProject = [];
    this.teamService.getByIdProject(id).subscribe((data) => {
      data.forEach((x:Team) => {
        this.userService.getById(x.id_account).subscribe((data) => {
          this.teamProject.push(x);
        });
      })
    });
  }
  getStaff() {
    if(this.project?.status == 'working') {
      return
    };
    this.userService.getAll().subscribe((data) => {
      this.listStaff = data.filter((x:User) => {  return x.role == 'staff' && x.status == 'activate'});
    });
  }

  currentDate(date: Date) {
    return this.datePipe.transform(date, 'dd-MM-YYYY');
  }

  addStaffToProject(id:number) {
    if (this.project.status == 'working') {
      alert('Dự án đang hoạt động');
      return
    }
    if (this.teamProject.length >= this.project.teamSize) {
      alert('Số lượng nhân viên đã đủ');
      return;
    }
    const data = {
      id_account: id,
      id_project: this.project.id,
      role: 'staff'
    }
    this.teamService.craete(data).subscribe((data) => {

      this.userService.getById(id).subscribe((data) => {
        
        this.listStaff = this.listStaff.filter((x:User) => { return x.id != id});
        
        this.userService.updateStatus({status: 'busy'}, id).subscribe((data) => {
        });
        this.teamProject.push(data);
      });

    }, (error) => {
      console.log(error);
      alert('Thêm nhân viên thất bại');
    }
    );
  }

  removeStaffFromProject(idAccount:number) {
    this.teamService.getByIdProject(this.project.id).subscribe((data) => {
      const team = data.filter((x:Team) => { return x.id_account == idAccount});
      //Cập nhật trạng thái nhân viên
      this.userService.updateStatus({status: 'activate'}, idAccount).subscribe((data) => { });
      //Xóa nhân viên khỏi dự án
      this.teamService.delete(team[0].id_team).subscribe((data) => {
        this.teamProject = this.teamProject.filter((x:User) => { return x.id != idAccount});
        this.userService.getById(idAccount).subscribe((data) => {
          this.listStaff.push(data);
        });
      });
    });
  }

  // xác nhận team
  identifyTeam() {
    if (this.teamProject.length < this.project.teamSize) {
      alert('Số lượng nhân viên chưa đủ');
      return;
    }
    const data = {
      id: this.project.id,
      status: 'working'
    }
    this.projectService.update(data, this.project.id).subscribe((data) => {
      alert('Xác nhận thành công');
      this.getTeamProject(this.valueOutProject.id_project);
    }, (error) => {
      console.log(error);
      alert('Xác nhận thất bại');
    });
  }

  doneProject() {
    const check = confirm('Bạn có chắc chắn muốn hoàn thành dự án?')
    if (!check) {
      return;
    }
    
    const data = {
      id: this.project.id,
      status: 'done'
    }

    const checkTask = this.teamProject.filter((x:any) => x.status_summary == 'busy');
    if (checkTask.length > 0) {
      alert('Còn nhân viên chưa hoàn thành công việc');
      return;
    }

    this.projectService.update(data, this.project.id).subscribe((data) => {
      this.teamProject.forEach((x:User) => {
        this.userService.updateStatus({status: 'activate'}, x.id).subscribe((data) => {});
      });
      alert('Xác nhận hoàn thành dự án thành công');
      this.getProject(this.project.id);
    }, (error) => {
      console.log(error);
      alert('Lỗi hoàn thành dự án');
    });
  }

  changePopup(user?: any) {
    this.popup = !this.popup;
    
    if(user) {
      this.valueOutProject.id = user.id_team;
      this.valueOutProject.id_account = user.id;
      this.valueOutProject.id_project = this.project.id;
      this.valueOutProject.name = user.name;
      this.taskService.getTasks().subscribe((data) => {
        let filter = data.filter((x:any) => x.id_account == user.id && x.id_project == this.project.id && x.status != 'finished');
        this.valueOutProject.sumtask = filter.length;
      })
    }
  }
  onChange(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.valueOutProject.id_account_change = Number(selectedId);
  }
  assignTask() {
    if (this.valueOutProject.id_account_change == 0) {
      alert('Chưa chọn nhân viên');
      return;
    }
    
    this.taskService.updateJobTransfer(this.valueOutProject, this.valueOutProject.id_account_change ).subscribe((data) => {
      this.teamService.updateJobTransfer(this.valueOutProject, this.valueOutProject.id_account_change ).subscribe((data) => {});
      this.userService.updateStatus({status: 'busy'}, this.valueOutProject.id_account_change).subscribe((data) => {});
      this.userService.updateStatus({status: 'activate'}, this.valueOutProject.id_account).subscribe((data) => {});
      this.getTeamProject(this.valueOutProject.id_project);
      
      alert('Gán task thành công');
      this.changePopup();
    }, (error) => {
      console.log(error);
      alert('Gán task thất bại');
    });
  }

  formatPrice(price: number) {
    return price.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
  }
}

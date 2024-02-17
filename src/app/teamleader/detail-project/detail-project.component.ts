import { Component, OnInit } from '@angular/core';
import { User, UserService } from '../../service/user/user.service';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Project, ProjectService } from '../../service/project/project.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Team, TeamService } from '../../service/team/team.service';
import { get } from 'jquery';

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
  
  constructor(
    private userService: UserService, 
    private projectService: ProjectService,
    private teamService: TeamService,
    private router: ActivatedRoute,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.router.paramMap.subscribe((params) => {
      this.getProject(Number(params.get('id')));
      this.getTeamProject(Number(params.get('id')));
    });
    this.getStaff();
    this.user = this.userService.getUser()
    console.log(this.user);
    
  }
  getProject(id:number) {
    this.projectService.getById(id).subscribe((data) => {
      this.project = data;
    });
  }

  getTeamProject(id:number) {
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
      console.log(data);
      alert('Xác nhận thành công');
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


  formatPrice(price: number) {
    return price.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
  }
}

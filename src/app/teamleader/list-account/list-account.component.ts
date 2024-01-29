import { Component, NgModule, OnInit } from '@angular/core';
import { User, UserService } from '../../service/user/user.service';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../service/data/data.service';
import { LoadComponent } from '../../component/load/load.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-account',
  standalone: true,
  imports: [NgFor, FormsModule, NgIf, ReactiveFormsModule, LoadComponent, RouterLink],
  templateUrl: './list-account.component.html',
  styleUrl: './list-account.component.css'
})
export class ListAccountComponent implements OnInit{
  listUser: User[] = [];
  filterUser: User[] = [];
  user:any
  filterValue: string = '';
  popup: boolean = false;
  userForm: FormGroup = new FormGroup({
    'name': new FormControl(null, Validators.required),
    'email': new FormControl(null, [Validators.email, Validators.required]),
    'role': new FormControl(null, Validators.required),
    'area': new FormControl(null, Validators.required),
    'password': new FormControl(null, Validators.required)
  })
  checkForm: boolean = false
  loadCreate: boolean = false
  constructor(
    private userService: UserService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.getUser()
  }

  getUser() {
    this.userService.getAll().subscribe((data)=>{
      this.listUser = data
      this.filterUser = data
    })
  }

  filter() {
    if(this.filterValue){
      this.filterUser = this.listUser.filter(p=>p.name.includes(this.filterValue))
    }else{
      this.filterUser = this.listUser
    }
  }

  get valueFilter():string{
    return this.filterValue
  }

  set valueFilter(value:string){
    this.filterValue = value.toLowerCase();
    this.filterUser = value 
                  ? this.listUser.filter(p => p.name.toLowerCase().includes(this.filterValue)) 
                  : this.listUser
  }

  filterRole(role:string) {
    this.filterUser = role 
                  ? this.listUser.filter(p => p.role.toLowerCase().includes(role)) 
                  : this.listUser
  }
  
  changePopup() {
    this.popup = !this.popup;
    this.userForm.reset()    
  }

  onSubmit() {
    if(!this.loadCreate){
      this.loadCreate = true
      if (!this.userForm.valid) {
        this.checkForm = true
        this.loadCreate = false
      }else {
        this.checkForm = false
        if (!this.user){
          this.userService.craete(this.userForm.value).subscribe((data)=>{
            this.getUser()
            alert('Tạo thành công')
            this.dataService.sendEmail(
                this.userForm.value.email, 
                'Cấp tài khoản',
                templateEmail(this.userForm.value.email, this.userForm.value.password)
              ).subscribe(
                (dataEmail)=>{
                  this.changePopup()
                  this.loadCreate = false
                  alert('Gửi Email thành công')
                },
                (error)=> {
                  this.loadCreate = false
                  alert('Gửi email thất bại')
                }
              )
            },
            (error) => {
              alert('tạo thất bại')
              console.log(error);
              this.loadCreate = false
            }
          )
        }else {
          this.userService.update(this.userForm.value, this.user.id).subscribe((data) => {
            this.getUser()
            alert('Cập nhật thành công')
            this.dataService.sendEmail(
                this.userForm.value.email, 
                'Cập nhật tài khoản',
                templateEmail(this.userForm.value.email, this.userForm.value.password)
              ).subscribe(
                (dataEmail)=>{
                  this.changePopup()
                  this.user = undefined
                  this.loadCreate = false
                  alert('Gửi Email thành công')
                },
                (error)=> {
                  this.loadCreate = false
                  alert('Gửi email thất bại')
                }
              )
          },
          (error)=> {
            console.log(error);
            alert('Cập nhật thất bại')
            this.loadCreate = false
          })
        }
      }
    }
  }

  editUser(id:number){
    this.userService.getById(id).subscribe((data)=>{
      this.user = data
      
      this.userForm.patchValue({
        'name': this.user.name,
        'email': this.user.email,
        'role': this.user.role,
        'area': this.user.area,
      })
      this.popup = !this.popup;
    })
  }

  countLeader() {
    const leaders = this.listUser.filter(x=>{ return x.role == 'leader'}).length
    return leaders
  }
  countStaff() {
    const staffs = this.listUser.filter(x=>{ return x.role == 'staff'}).length
    return staffs
  }
}

function templateEmail(email: string, password: string): string {
  const html = `
  <html>
    <head>
      <style>
        span {
          border :1px solid gray;
          padding: 5px 10px;
          border-radius: 7px;
          font-size: 18px;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <div>
        <h1>Chào mừng bạn đến với công ty của chúng tôi</h1>
        <p>Email đăng nhập: ${email}</p>
        <p>Mật khẩu: <span>${password}</span></p>
        <p>Cảm ơn bạn đã tham gia!</p>
      </div>
    </body>
  </html>
  `;

  return html;
}
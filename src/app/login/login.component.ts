import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../service/data/data.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CookieService } from '../service/cookie.service';
import { UserService } from '../service/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  formLogin: FormGroup = new FormGroup({
    'email': new FormControl(null,
      [Validators.email, Validators.required]
      ),
    'password': new FormControl(null,
      [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(30)
      ])
  })
  checkFrom: string = '';

  ngOnInit(): void {
    const user = this.user.getUser()
    const token = this.cookie.getCookie('token')
    if(user.length != 0 && token){
      this.router.navigate([''])
    }
  }
  constructor(
    private cookie: CookieService,
    private user: UserService,
    private router: Router
  ) {}

  onSubmit() {
    if(!this.formLogin.valid) {
      this.checkFrom = 'Bạn nhập chưa đủ thông tin'
    }else {
      this.checkFrom = '';
      this.user.login(this.formLogin.value).subscribe(
        (data) => {
          this.cookie.setCookie('token', data.access_token, 6);
          this.user.getPayload().subscribe((data)=> {
            this.user.getById(data.id).subscribe((data)=>{
              this.user.setUser(data)
              this.router.navigate([''])
            })
          })
        },
        (error) => {
          this.checkFrom = 'Email hoặc mật khẩu chưa chính xác';
        }
      )
    }
  }
}

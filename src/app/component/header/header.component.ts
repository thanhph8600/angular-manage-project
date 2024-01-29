import { Component, OnInit } from '@angular/core';
import { User, UserService } from '../../service/user/user.service';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from '../../service/cookie.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  user:User[] =[]
  constructor(
    private userService: UserService, 
    private router: Router, 
    private cookie: CookieService
  ) {}
  ngOnInit(): void {
    const token = this.cookie.getCookie('token')
    if(!token){
      this.router.navigate(['login'])
    }
    this.userService.getPayload().subscribe((data)=> {
      this.userService.getById(data.id).subscribe((data)=>{
        this.userService.setUser(data)
      })
    })
    this.user = this.userService.getUser()
  }

  logout() {
    this.cookie.setCookie('token', '',0)
    this.router.navigate(['login'])
  }
}

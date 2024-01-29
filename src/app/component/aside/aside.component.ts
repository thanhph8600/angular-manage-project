import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User, UserService } from '../../service/user/user.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css'
})
export class AsideComponent implements OnInit{
  role:string ='';
  constructor(private userService: UserService) {}
  ngOnInit(): void {
    const user:User[] = this.userService.getUser()
    this.role = user[0].role
  }
}

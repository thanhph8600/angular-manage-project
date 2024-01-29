import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserService } from '../service/user/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit{
  userForm: FormGroup = new FormGroup({
    'name': new FormControl(null,Validators.required),
    'email': new FormControl(null, [Validators.email, Validators.required]),
    'phone': new FormControl(null, [
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.required
    ]),
    'area': new FormControl(null),
    'address': new FormControl(null, [Validators.required, Validators.minLength(10)]),
    'thumb': new FormControl(null)
  })
  user:User[]=[];
  constructor(private userService: UserService){}

  ngOnInit(): void {
    this.user = this.userService.getUser()
    if (this.user.length > 0) {
      this.userForm.patchValue(this.user[0]);
    }
  }

  changeThumb(event:any) {
    const files = event.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const fileDataURL = e.target.result;
        this.userForm.patchValue({ thumb: file });
        this.user[0].thumb = fileDataURL
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(){
    this.userService.update(this.userForm.value, this.user[0].id).subscribe(
      (data) =>{
        this.userService.getById(this.user[0].id).subscribe((newUser)=>{
          this.userService.setUser(newUser);
          console.log(newUser);
        })
      },
      (error) =>{
        console.log(error);
      }
    )
  }
}

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
  })
  checkUpload:boolean = false;
  uploadForm:FormData = new FormData();
  nameFile:string = '';
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
        this.uploadForm.append('thumb', file);
        this.user[0].thumb = fileDataURL
        this.nameFile = file.name;
      };
      reader.readAsDataURL(file);
    }
    this.checkUpload = true;
  }

  onSubmit(){
    if(this.checkUpload) {
      const file = this.uploadForm.get('thumb');
      this.userService.uploadFile(file).subscribe(
        (res) => {
          let urlFirebase = 'https://firebasestorage.googleapis.com/v0/b/project-management-dc43a.appspot.com/o/';
          let token = '?alt=media&token=6aa61ebc-1e5a-400d-b35b-d286f7f00478'
          this.userService.update({thumb: urlFirebase + this.nameFile + token}, this.user[0].id).subscribe()
        },
        (error) => {
          console.log(error);
        }
      )
    }    
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

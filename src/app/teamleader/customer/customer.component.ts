import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User, UserService } from '../../service/user/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit{
  valueFilter: string='';
  filterCustomer: User[] = [];
  popup: boolean = false;
  idUser:number = 0;
  password: string = '';
  formCustomer: FormGroup = new FormGroup({
    'name': new FormControl(null, Validators.required),
    'email': new FormControl(null, [Validators.email, Validators.required]),
    'phone': new FormControl(null, [Validators.required, Validators.pattern('^[0-9]{10}')]),
    'status': new FormControl('customer', Validators.required),
    'password': new FormControl(null, Validators.required)
  })
  constructor(private userService: UserService) {  }
  ngOnInit() {
    this.getCustomer();
  }
  getCustomer() {
    this.userService.getAllCustomer().subscribe(data => {
      this.filterCustomer = data;
    });
  }
  changePopup() {
    this.popup = !this.popup;
    this.formCustomer.reset();
    this.formCustomer.patchValue({
      'status': 'customer'
    });
  }
  onSubmit() {
    if(this.idUser == 0) {
      this.userService.craete(this.formCustomer.value).subscribe(data => {
        this.getCustomer();
        this.changePopup();
        alert('Create customer success');
      });
    } else{
      let data = this.formCustomer.value;
      if(this.formCustomer.value.password == this.password) {
        delete data.password;
      }
            
      this.userService.update(data, this.idUser).subscribe(data => {
        this.idUser = 0;
        this.getCustomer();
        this.changePopup();

        alert('Update customer success');
      });
    }
    
  }
  btn_edit(id: number) {
    this.userService.getById(id).subscribe(data => {
      this.formCustomer.patchValue({
        'name': data.name,
        'email': data.email,
        'phone': data.phone,
        'password': data.password
      });
      this.password = data.password;
      this.idUser = id;
      this.popup = !this.popup;
    });
  }
}

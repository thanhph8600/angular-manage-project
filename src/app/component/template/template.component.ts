import { Component } from '@angular/core';
import { AsideComponent } from '../aside/aside.component';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { LoadComponent } from '../load/load.component';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [AsideComponent,HeaderComponent, RouterOutlet, LoadComponent],
  templateUrl: './template.component.html',
  styleUrl: './template.component.css'
})
export class TemplateComponent {

}

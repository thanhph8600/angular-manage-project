import { Component } from '@angular/core';
import { AsideComponent } from '../../component/aside/aside.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsideComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}

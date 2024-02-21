import { Component, ElementRef, NgModule, OnInit, ViewChild } from '@angular/core';
import { AsideComponent } from '../../component/aside/aside.component';
import { User, UserService } from '../../service/user/user.service';
import { NgFor } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Chart } from 'chart.js';
import ApexCharts from 'apexcharts';
import { Project, ProjectService } from '../../service/project/project.service';
import { FormsModule} from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsideComponent, NgFor, NgChartsModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  listStaffTop: User[] = [];
  listAccount: User[] = [];
  listProject: Project[] = [];
  listCustomer: User[] = [];
  revenueData: Revenue[] = [];
  selectYear: number = new Date().getFullYear();
  constructor(
    private userService: UserService,
    private projectService: ProjectService
  ) {}
  ngOnInit(): void {
    this.userService.getTop5Staff().subscribe((data: User[]) => {
      this.listStaffTop = data;
    });
  
    this.getValueUser();

    this.getValueRevenue();
    this.getValueProject();
    this.getValueCustomer();
  }

  getValueUser() {
    this.userService.getAll().subscribe((data: User[]) => {
      this.listAccount = data;
      let north = this.listAccount.filter((user)=>{
        return user.area == 'North';
      })
      let center = this.listAccount.filter((user)=>{
        return user.area == 'Central';
      })
      let south = this.listAccount.filter((user)=>{
        return user.area == 'South';
      })
      this.renderChartStaff(north.length, center.length, south.length);
    })
  }
  renderChartStaff(north:number, center:number, south:number): void {

    const xValues = ["Miền Bắc", "Miền Trung", "Miền Nam"];
    const yValues = [north, center, south];
    const barColors = [
      "#b91d47",
      "#00aba9",
      "#2b5797",
      "#e8c3b9",
      "#1e7145"
    ];
    
    new Chart("staff-chart", {
      type: "pie",
      data: {
        labels: xValues,
        datasets: [{
          backgroundColor: barColors,
          data: yValues
        }]
      },
      options: {

      }
    });
  }

  getValueRevenue() {
    this.projectService.getRevenue(this.selectYear).subscribe((data: Revenue[]) => {
      this.revenueData = data.map(item => {
        return {
          month: item.month,
          total_revenue: item.total_revenue
        };
      });
      
      this.renderChartRevenue();

    });
  }
  renderChartRevenue() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const defaultData = Array(12).fill(0)

    this.revenueData.forEach((itemRevenue) => {
      defaultData.forEach((item, index) => {
        if(Number(index+1) == Number(itemRevenue.month)) {
          defaultData[index] = Number(itemRevenue.total_revenue);
        }
      });
    });

    const options = {
      series: [{
        name: 'Series 1',
        data: defaultData
      }],
      chart: {
        type: 'bar',
        height: 200,
        width: 700
      },
      xaxis: {
        categories: months
      }
    };

    const chart = new ApexCharts(document.getElementById('revenue-chart'), options);
    chart.render();
  }

  getValueProject() {
    this.projectService.getAll().subscribe((data: Project[]) => {
      this.listProject = data;
      let processing = this.listProject.filter((project)=>{ return project.status == 'processing'}).length;
      let working = this.listProject.filter((project)=>{ return project.status == 'working'}).length;
      let done = this.listProject.filter((project)=>{ return project.status == 'done'}).length;
      
      this.renderChartProject(processing, working, done);
    });
  }
  renderChartProject(processing: number, working:number, done:number): void {

    const options = {
      chart: {
        type: 'pie',
        height: 450
      },
      series: [processing, working, done],
      labels: ['PROCESSING', 'WORKING', 'DONE'],
      colors: ['#3B82F6', '#EAB308', '#22C55E']
    };

    const chart = new ApexCharts(document.getElementById('project-chart'), options);
    chart.render();
  }

  getValueCustomer() {
    this.userService.getAllCustomer().subscribe((data: User[]) => {
      this.listCustomer = data;
      this.listCustomer.slice(0, 5);
    });
  }
}

interface Revenue {
  month: number ;
  total_revenue: number;
}
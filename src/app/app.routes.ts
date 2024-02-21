import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './teamleader/dashboard/dashboard.component';
import { ProjectComponent } from './teamleader/project/project.component';
import { RoleGuard } from './service/authGuard.service';
import { TemplateComponent } from './component/template/template.component';
import { TaskComponent } from './teamleader/tasks/task.component';
import { UserComponent } from './user/user.component';
import { ListAccountComponent } from './teamleader/list-account/list-account.component';
import { NotfountComponent } from './notfount/notfount.component';
import { DetailaccountComponent } from './teamleader/detailaccount/detailaccount.component';
import { DetailProjectComponent } from './teamleader/detail-project/detail-project.component';
import { CustomerComponent } from './teamleader/customer/customer.component';

export const routes: Routes = [
    {path: 'login',component: LoginComponent},
    {path: '', component: TemplateComponent, 
        canActivate:[RoleGuard], 
        data: {
            expectedRole: (route: ActivatedRouteSnapshot) => {
                return staff; 
            },
        },
        children: [
            {path: '', component: DashboardComponent},
            {path: 'dashboard', component: DashboardComponent},
            {path: 'project', component: ProjectComponent},
            {
                path: 'detail-project/:id', 
                component: DetailProjectComponent, canActivate: [RoleGuard],
                data: {
                    expectedRole: (route: ActivatedRouteSnapshot) => {
                        return staff; 
                    },
            }},
            {path: 'detail-project/:idProject/task/:idUser', component: TaskComponent},
            {path: 'user', component: UserComponent},
            {
                path: 'account', 
                component: ListAccountComponent, 
                canActivate: [RoleGuard],
                data: {
                    expectedRole: (route: ActivatedRouteSnapshot) => {
                        return admin; 
                    },
                }
            },
            {
                path: 'customer', 
                component: CustomerComponent, 
                canActivate: [RoleGuard],
                data: {
                    expectedRole: (route: ActivatedRouteSnapshot) => {
                        return admin; 
                    },
                }
            },
        ]
    },
    {path: '404-not-fond',component: NotfountComponent},
];

const admin = ['admin']
const leader = ['admin', 'leader']
const staff = ['admin', 'leader', 'staff']
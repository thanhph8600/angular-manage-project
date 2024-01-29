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
            {path: 'tasks', component: TaskComponent},
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
                path: 'account/:id', 
                component: DetailaccountComponent, 
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
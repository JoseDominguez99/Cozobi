import { Routes } from '@angular/router';
import { DashboardCozobiComponent } from './dashboard/dashboardCozobi/dashboardCozobi.component';
import { SelectionComponent } from './dashboard/pages/selection/selection.component';

export const routes: Routes = [
    {
        path: 'dashboard',
        component: DashboardCozobiComponent,
        children: [
            {
                path: 'selection',
                component: SelectionComponent
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'app',
        pathMatch: 'full'
    }
];

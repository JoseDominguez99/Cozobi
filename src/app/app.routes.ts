import { Routes } from '@angular/router';
import { SelectionComponent } from './pages/selection/selection.component';
import { InfoComponent } from './pages/info/info.component';
import { DatosComponent } from './pages/datos/datos.component';
import { PublicidadComponent } from './pages/publicidad/publicidad.component';
import { HomeIngeComponent } from './pages/homeInge/homeInge.component';
import { HomeAgriComponent } from './pages/homeAgri/homeAgri.component';
import { PlantasComponent } from './pages/plantas/plantas.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/selection',
        pathMatch: 'full'
    },
    {
        path:'selection',
        component: SelectionComponent
    },
    {
        path:'info',
        component: InfoComponent
    },
    {
        path:'datos',
        component: DatosComponent
    },
    {
        path:'publicidad',
        component: PublicidadComponent
    },
    {
        path:'homeInge',
        component: HomeIngeComponent
    },
    {
        path:'homeAgri',
        component: HomeAgriComponent
    },
    {
        path:'plantas',
        component: PlantasComponent
    },
    {
        path: '**',
        redirectTo: '/selection',
        pathMatch: 'full'
    },
];

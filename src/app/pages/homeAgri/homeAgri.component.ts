import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { MapaComponent } from '../../components/mapa/mapa.component';

@Component({
  selector: 'app-home-agri',
  imports: [HeaderComponent, MapaComponent, CommonModule],
  templateUrl: './homeAgri.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAgriComponent { 

  ubicacion = {
    nombre: 'San Pablo Huixtepec, Oaxaca, México',
    suelo: 'Suelo franco',
    temperatura: 24,
    humedad: 65
  };

  cultivos = [
    { nombre: 'Maíz', familia: 'Gramineae, Zea mays' },
    { nombre: 'Frijol', familia: 'Fabaceae, Phaseolus vulgaris' },
    { nombre: 'Tomate', familia: 'Solanaceae, Solanum lycopersicum' }
  ];


}

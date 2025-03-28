import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MapaComponent } from '../../components/mapa/mapa.component';

@Component({
  selector: 'app-home-agri',
  imports: [HeaderComponent, MapaComponent],
  templateUrl: './homeAgri.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAgriComponent { }

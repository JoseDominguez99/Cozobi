import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, viewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MapaComponent } from '../../components/mapa/mapa.component';


@Component({
  selector: 'app-home-inge',
  imports: [HeaderComponent, MapaComponent],
  templateUrl: './homeInge.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIngeComponent implements OnInit{ 

  ngOnInit(): void {
    
  }


}

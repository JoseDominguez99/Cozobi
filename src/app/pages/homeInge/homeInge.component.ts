import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, viewChild, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MapaComponent } from '../../components/mapa/mapa.component';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home-inge',
  imports: [HeaderComponent, MapaComponent, FormsModule, CommonModule],
  templateUrl: './homeInge.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIngeComponent{ 
@ViewChild(MapaComponent) mapa!: MapaComponent;
searchQuery: string = '';

onSearch(){
  if(!this.searchQuery.trim()) return;
  this.mapa.searchPlace(this.searchQuery);
}

clearSearch(){
  this.searchQuery = '';
  this.mapa.clearSearch();
}
}

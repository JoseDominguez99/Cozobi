import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MapaComponent } from '../../components/mapa/mapa.component';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

@Component({
  selector: 'app-home-agri',
  imports: [HeaderComponent, MapaComponent, CommonModule, FormsModule],
  templateUrl: './homeAgri.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAgriComponent { 

  @ViewChild(MapaComponent) mapa!: MapaComponent;
  searchQuery: string = '';
  private firestore: Firestore = inject(Firestore);

  ubicaciones: Observable<any[]>; 

  constructor() {
      const ubicacionesCollection = collection(this.firestore, 'pueblos');
      this.ubicaciones = collectionData(ubicacionesCollection, { idField: 'Name' });
      const plantasCollection = collection(this.firestore, 'plantas');
      const plantas = collectionData(plantasCollection, { idField: 'id' });
  }

  loadMoreResults() {
    if (this.mapa?.canLoadMore()) {
      this.mapa.searchPlace(this.searchQuery, true);
    }
  }

  get showLoadMore() {
    return this.mapa?.canLoadMore() && !this.isLoading && this.searchResults.length > 0;
  }

  get searchResults() {
    return this.mapa?.searchResults() || [];
  }

  get isLoading() {
    return this.mapa?.isLoading() || false;
  }

  get searchError() {
    return this.mapa?.searchError || null;
  }

  onSearch() {
    if (this.searchQuery.trim() && this.mapa) {
      this.mapa.searchPlace(this.searchQuery);
    }   
  }

  onSelectResult(result: any) {
    if (this.mapa) {
      this.mapa.selectResult(result);

    }
  }

  clearSearch() {
    this.searchQuery = '';
    if (this.mapa) {
      this.mapa.clearSearch();
    }
  }

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

import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MapaComponent } from '../../components/mapa/mapa.component';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

@Component({
  selector: 'app-home-inge',
  imports: [HeaderComponent, MapaComponent, FormsModule, CommonModule],
  templateUrl: './homeInge.component.html',
  styles: `
    :host {
      display: block;
    }
    .search-result-item {
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .search-result-item:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .search-result-item h3 {
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #111827;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIngeComponent { 
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
}

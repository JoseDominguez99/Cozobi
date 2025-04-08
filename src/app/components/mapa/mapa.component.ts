import { Component, inject, Input, OnInit, ViewChild, signal, ChangeDetectionStrategy} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { ViewEncapsulation } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DecimalPipe } from '@angular/common';
import { SearchService } from '../../services/search.service';


export const DEFAULT_LAT = 17.06542;
export const DEFAULT_LON =  -96.72365;

type Coordinates = [number, number];


@Component({
  selector: 'app-mapa',
  imports: [DecimalPipe],
  templateUrl: './mapa.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 300px;
    }
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .coordinates-display {
      font-family: monospace;
    }
    .error-message {
      color: red;
      font-size: 0.8rem;
    }
  `,
  encapsulation: ViewEncapsulation.None,
})
export class MapaComponent implements OnInit {
  private searchService = inject(SearchService);
  searchResults = signal<any[]>([]);
  selectedResult = signal<any>(null);

  // Iniciar código para crear un mapa de openStreetMap
  private map: any;
  @Input() lat: number = DEFAULT_LAT;
  @Input() lon: number = DEFAULT_LON;
  

  currentCoords: Coordinates | null = null;
  private markers: L.Marker[] = [];
  private searchMarkers: L.Marker | null = null;
  isLoading = signal(false);
  searchError: string | null = null;
  private locationService = inject(LocationService);
  currentPage = signal(1);
  resultsPerPage = 10;
  constructor() {}

  ngOnInit(): void {
    this.getUserLocation();
  }

  private async getUserLocation(): Promise<void>{
    try{
      const position = await this.locationService.getCurrentPosition();
      this.lat = position.coords.latitude;
      this.lon = position.coords.longitude;
      this.currentCoords = [this.lat, this.lon];
      console.log('Ubicación: ', this.currentCoords);
      this.initMap();
    }catch(e){
      console.warn('No se pudo usar la ubicación precisa, usando ubicación por defecto', e);
      // Intentar obtener ubicación aproximada por IP como fallback
      try {
        const approxLocation = await this.locationService.getApproximateLocation();
        this.lat = approxLocation.lat;
        this.lon = approxLocation.lon;
        this.currentCoords = [this.lat, this.lon];
        console.log('Ubicación aproximada', approxLocation);
        
      } catch {
        console.warn('No se pudo obtener ubicación aproximada, usando valores por defecto');
        this.currentCoords = [DEFAULT_LAT, DEFAULT_LON];
      }
      
      this.initMap();
    }
  }

  

  private initMap(): void {
    
    this.map = L.map('map', {
      center: [this.lat, this.lon],
      attributionControl: false,
      zoom: 12,
      zoomControl: true,
      zoomAnimation: true,
      doubleClickZoom: true,
      fadeAnimation: false,
      preferCanvas: true,
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom: 20,
      minZoom: 2,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright"></a> contributors'
    }).addTo(this.map);
    
    // Hasta aquí podemos tener un mapa correctamente cargado y funcional, desde aquí, son funciones para agregar funciones al mapa
    this.addUserMarker();
  }

  // Agregar un marcador a la ubicación del usuario
  private addUserMarker(): void {
    const userIcon = L.icon({
      iconUrl: 'assets/marker-icon-2x.png', // Asegúrate de tener este archivo
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([this.lat, this.lon], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('Estás aquí')
      .openPopup();
  }

  private moveTo(lat: number, lon: number, zoom: number){
    this.map.setView([lat, lon, zoom]);
    this.addSearchMark(lat, lon);
  }

  public async searchPlace(query: string, loadMore: boolean = false): Promise<void> {
    if (!loadMore) {
      this.currentPage.set(1);
      this.searchResults.set([]);
    } else {
      this.currentPage.update(p => p + 1);
    }
    this.isLoading.set(true);
    this.searchError = null;
    this.searchResults.set([]);
    this.selectedResult.set(null);

    try{
      const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
      if(coordPattern.test(query)){
        const [lat, lon] = query.split(',').map(parseFloat);
        this.moveTo(lat, lon, 15);
        this.searchResults.set([
          {
          lat: lat.toString(),
          lon: lon.toString(),
          display_name: `Coordenadas: ${lat}, ${lon}`,
          type: 'coordinates'
          }
        ]);
        return;
      }
    

      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${
        encodeURIComponent(query)}&limit=10`);
      const data = await response.json();

      if (data?.length > 0) {
        if(this.currentCoords){
          data.sort((a:any, b:any) =>{
            const distanceA = this.calculateDistance(
              this.currentCoords![0], this.currentCoords![1],
              parseFloat(a.lat), parseFloat(a.lon)
            );
            const distanceB = this.calculateDistance(
              this.currentCoords![0], this.currentCoords![1],
              parseFloat(b.lat), parseFloat(b.lon)
            );
            return distanceA - distanceB;
          });
        }

        if (loadMore) {
          this.searchResults.update(results => [...results, ...data]);
        } else {
          this.searchResults.set(data);
        }

        if (!loadMore) {
          this.selectResult(data[0]);
        }
      }else{

      }
    }catch(err){
      this.searchError = 'Error de búsqueda';
    } finally{
      this.isLoading.set(false);
    }
  }

  // Calcula la distancia entre dos puntos en kilómetros usando la fórmula Haversine
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number){
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * 
    Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R *c;
  }

  private deg2rad(deg: number){
    return deg * (Math.PI / 180);
  }

  public canLoadMore(): boolean {
    return this.searchResults().length >= this.currentPage() * this.resultsPerPage;
  }

  private addSearchMark(lat: number, lon: number): void {
    if(this.searchMarkers) this.map.removeLayer(this.searchMarkers);

    const searchIcon = L.icon({
      iconUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
    });

    this.searchMarkers = L.marker([lat, lon], { icon: searchIcon })
    .addTo(this.map)
    .bindPopup('Ubicación de búsqueda')
  }
  
  public selectResult(result: any): void {
    this.selectedResult.set(result);
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    this.moveTo(lat, lon, 15);
    
    // Actualiza el marcador de búsqueda
    if (this.searchMarkers) {
      this.searchMarkers.bindPopup(
        `<b>${result.display_name || 'Ubicación'}</b><br>
         <small>Tipo: ${result.type || 'desconocido'}</small>`
      ).openPopup();
    }
  }

  public clearSearch(): void {
  if (this.searchMarkers) this.map.removeLayer(this.searchMarkers);
  this.searchError = null;
  this.searchResults.set([]);
  this.selectedResult.set(null);
}
}
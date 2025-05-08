import { Component, inject, Input, OnInit, ViewChild, signal, ChangeDetectionStrategy} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { ViewEncapsulation } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DecimalPipe } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { Firestore, collection, collectionData, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';



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
  private firestore: Firestore = inject(Firestore);


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
  constructor() {
    

  }

  ngOnInit(): void {
    this.getUserLocation();
  }

  private async getUserLocation(): Promise<void> {
    try {
      console.log('Intentando obtener ubicación precisa');
      const position = await this.locationService.getCurrentPosition();

      console.log('Precisión obtenida:', position.coords.accuracy, 'metros');
      console.log('Coordenadas: ', position.coords.latitude, position.coords.longitude, position.coords.altitude);

      this.lat = position.coords.latitude;
      this.lon = position.coords.longitude;
      this.currentCoords = [this.lat, this.lon];
      this.initMap(position.coords.accuracy);
    } catch(e: any) {
      console.warn('Error al obtener ubicación precisa:', e);
      
      // Mostrar el error al usuario si es relevante
      if (e.code === 1) { // PERMISSION_DENIED
        this.showPermissionWarning();
      }
      
      // Intentar obtener ubicación aproximada por IP
      this.getFallbackLocation();
      
      this.initMap();
    }
  }

  private async  getFallbackLocation(): Promise<void> {
    try {
      console.log('Obteniendo ubicación aproximada');
      const aproxLocation = await this.locationService.getApproximateLocation();

      console.log('Ubicación aproximada: ', aproxLocation);
      this.lat = aproxLocation.lat;
      this.lon = aproxLocation.lon;
      this.currentCoords = [this.lat, this.lon];

    } catch (ipError){
      console.warn('Error al obtener ubicación aproximada');
      this.currentCoords = [DEFAULT_LAT, DEFAULT_LON];
      
    }
  }

  private showPermissionWarning(): void{
    const warningElemt = document.createElement('div');
    warningElemt.className = 'geolocation-Warnings';
    
    warningElemt.innerHTML = `<p>Activa los permisos de ubcación para brindarte el servicio completo, por favor</p>
    <button id="retry">Intentar de nuevo</button>`;

    document.body.appendChild(warningElemt);

    document.getElementById('retry')?.addEventListener('click', () =>{
      this.getUserLocation();
      warningElemt.remove();
    })
  }

  

  private initMap(accuracy?: number): void {
    
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
    this.addUserMarker(accuracy);
  }

  // Agregar un marcador a la ubicación del usuario
  private addUserMarker(accuracy?: number): void {
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
    const pueblosRef = collection(this.firestore, 'pueblos');
    this.selectedResult.set(result);    
    const locationName = result.name;
    
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    this.moveTo(lat, lon, 15);
    
    const q = query(
      pueblosRef, 
      where('Nombre', '==', locationName),
    )
    
    
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
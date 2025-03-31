import { Component, importProvidersFrom, inject, Input, OnInit} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { ViewEncapsulation } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DecimalPipe } from '@angular/common';


export const DEFAULT_LAT = 17.06542;
export const DEFAULT_LON =  -96.72365;

type Coordinates = [number, number];


@Component({
  selector: 'app-mapa',
  imports: [DecimalPipe],
  templateUrl: './mapa.component.html',
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
  // Iniciar código para crear un mapa de openStreetMap
  private map: any;
  @Input() lat: number = DEFAULT_LAT;
  @Input() lon: number = DEFAULT_LON;
  

  currentCoords: Coordinates | null = null;
  private markers: L.Marker[] = [];
  private searchMarkers: L.Marker | null = null;
  isLoading: boolean = false;
  searchError: string | null = null;
  private locationService = inject(LocationService);
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
      this.initMap();
    }catch(e){
      console.warn('No se pudo usar la ubicación precisa, usando ubicación por defecto', e);
      // Intentar obtener ubicación aproximada por IP como fallback
      try {
        const approxLocation = await this.locationService.getApproximateLocation();
        this.lat = approxLocation.lat;
        this.lon = approxLocation.lon;
        this.currentCoords = [this.lat, this.lon];
      } catch {
        console.warn('No se pudo obtener ubicación aproximada, usando valores por defecto');
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

  public async searchPlace(query: string): Promise<void> {
    this.isLoading = true;
    this.searchError = null;

    try{
      const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
      if(coordPattern.test(query)){
        const [lat, lon] = query.split(',').map(parseFloat);
        this.moveTo(lat, lon, 15);
        return;
      }
    

      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${
        encodeURIComponent(query)}`);
      const data = await response.json();

      if(data?.length > 0){
        const firstResult = data[0];
        this.moveTo(parseFloat(firstResult.lat), parseFloat(firstResult.lon), 15);

        if(this.searchMarkers){
          this.searchMarkers.bindPopup(
            `
          <b>${firstResult.display_name || 'Ubicación'}</b><br>
          <small>Tipo: ${firstResult.type || 'desconocido'}</small>
        `).openPopup();
        }
      }else{
        this.searchError = 'No se encontró resultados para la búsqueda';
      }
    }catch(err){
      this.searchError = 'Error de búsqueda';
    } finally{
      this.isLoading = false;
    }
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

  public clearSearch(): void {
    if(this.searchMarkers) this.map.removeLayer(this.searchMarkers);
    this.searchError = null;
  }
}
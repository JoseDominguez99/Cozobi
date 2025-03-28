import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface LocationCoordinates {
  coords:{
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    altitude?: number;
  };
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private currentPosition = signal<GeolocationPosition | null> (null);
  private positionError = signal<GeolocationPositionError | null> (null);
  private isLoading = signal(false);

  constructor(private http: HttpClient) { }

  // Obtenemos la posisición actual del usuario
  getCurrentPosition():Promise<GeolocationPosition> {
    this.isLoading.set(true);
    this.positionError.set(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation){
        const error: GeolocationPositionError = {
          code: 2,
          message: 'El navegador no soporta la geolocalización',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        };
        this.positionError.set(error);
        this.isLoading.set(false);
        reject(error);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition.set(position);
          this.isLoading.set(false);
          resolve(position);
        },
        (error) => {
          this.positionError.set(error);
          this.isLoading.set(false);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }

  // Obtener la ubicación almacenada (si existe)
  get storedPosition() {
    return this.currentPosition();
  }

  // Obtener el estado de carga
  get loading() {
    return this.isLoading();
  }

  // Obtener el último error (si existe)
  get error() {
    return this.positionError();
  }

  // Obtener coordenadas aproximadas basadas en IP (como fallback)
  async getApproximateLocation(): Promise<{lat: number, lon: number}> {
    try {
      const response = await this.http.get<{lat: number, lon: number}>('https://ipapi.co/json/').toPromise();
      return response || {lat: 0, lon: 0};
    } catch {
      return {lat: 0, lon: 0};
    }
  }
}
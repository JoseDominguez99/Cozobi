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
  private watchId: number | null = null;

  constructor(private http: HttpClient) { }

  // Obtenemos la posisición actual del usuario
  async getCurrentPosition(): Promise<GeolocationPosition> {
    this.isLoading.set(true);
    this.positionError.set(null);
  
    if(this.watchId !== null){
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = this.createGeolocationError(2, 'El navegador no soporta la geolocalización');
        this.handleError(error, reject);
        return;
      }


      //Verificamos el estado del permiso
      this.checkPermission().then(permissionGranted =>{
        if(!permissionGranted){
          const error = this.createGeolocationError(1, 'Permisos denegados');
          this.handleError(error, reject);
          return;
        }
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            console.log('Posición obtenida: ', position);
            //Solo si se tiene una precisión menor a 100 metros
            if(position.coords.accuracy < 100){
              if(this.watchId !== null){
                navigator.geolocation.clearWatch(this.watchId);
                this.watchId = null;
              }
              this.handleSuccess(position, resolve);
            }
          },
          (error) =>{
            if(this.watchId !== null){
              navigator.geolocation.clearWatch(this.watchId);
              this.watchId = null;
            }
            this.handleError(error, reject);
          },
          options
        );

        setTimeout(() =>{
          if(this.watchId !== null){
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            const error = this.createGeolocationError(3, 'Tiempo de espera agotado');
            this.handleError(error, reject);
          }
        }, options.timeout);
      });
    });
  }

  private async checkPermission(): Promise<boolean>{
    if(!navigator.permissions) return true;

    try{
      const permissonStatus = await navigator.permissions.query({name: 'geolocation'});
      return permissonStatus.state !== 'denied';
    }catch{
      return true;
    }
  }

  private createGeolocationError(code: number, message: string): GeolocationPositionError{
    return{
      code,
      message,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    };
  }

  private handleSuccess(position: GeolocationPosition, resolve: (value: GeolocationPosition) =>void){
    this.currentPosition.set(position);
    this.isLoading.set(false);
    resolve(position);
  }

  handleError(error: GeolocationPositionError, reject: (reason?: any) => void){
    console.error('Error delocalización: ', error);
    this.positionError.set(error);
    this.isLoading.set(false);
    reject(error);
  }

  private actuallyGetPosition(resolve: (value: GeolocationPosition) => void, 
                           reject: (reason?: any) => void) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('Posición obtenida:', position);
      this.currentPosition.set(position);
      this.isLoading.set(false);
      resolve(position);
    },
    (error) => {
      console.error('Error de geolocalización:', error);
      this.positionError.set(error);
      this.isLoading.set(false);
      reject(error);
    },
    { 
      enableHighAccuracy: true, 
      timeout: 10000, // Aumentar timeout a 10 segundos
      maximumAge: 0 
    }
  );
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
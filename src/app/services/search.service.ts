import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private readonly API_URL = 'https://nominatim.openstreetmap.org/search';
  private cache = new Map<string, any>();

  async search(query: string): Promise<any[]> {
    if (this.cache.has(query)) {
      return this.cache.get(query);
    }

    const response = await fetch(
      `${this.API_URL}?format=json&q=${encodeURIComponent(query)}&limit=10`
    );
    const data = await response.json();
    this.cache.set(query, data);
    return data; 
  }
  constructor() { }
}

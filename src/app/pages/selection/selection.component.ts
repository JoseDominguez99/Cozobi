import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';



@Component({
  selector: 'app-selection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './selection.component.html',
  
})
export class SelectionComponent { 
  cards = [
    {
      title: 'Agricultor',
      content: 'ACCEDIENDO COMO AGRICULTOR PODRÁS VER TODO EL CONTENIDO DE FORMA SENCILLA, EVITANDO TECNISÍSMOSINNECESARIOS Y MOSTRANDO DATOS RELEVANTE Y NECESARIOS.',
      descButton: 'Acceder como agricultor',
      image: 'assets/agricultor.png',
      path: '/homeAgri'
    },
    {
      title: 'Ingeniero agrónomo',
      content: 'ACCEDIENDO COMO INGENIERO AGRÓNOMO, PODRÁS VER LA INFORMACIÓN DE UNA FORMA MÁS TÉCNICA, ADEMÁS DE PODER DESCARGAR LOS DATOS DE TU INTERÉS EN FORMATO XLSX.',
      descButton: 'Acceder como ingeniero',
      image: '',
      path: '/homeInge'
    },
  ];
}

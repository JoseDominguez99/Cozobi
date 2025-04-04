import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  items=[
    {
      title: '¿Quienes somos?',
      path: '/info'
    },
    {
      title: 'Extracción de datos',
      path: '/datos'
    },
    {
      title: 'Publicidad',
      path: '/publicidad'
    },
    {
      title: 'Todas las plantas',
      path: '/plantas'
    }
  ];
}

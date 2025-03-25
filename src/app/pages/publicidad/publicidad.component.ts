import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-publicidad',
  imports: [],
  templateUrl: './publicidad.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicidadComponent { }

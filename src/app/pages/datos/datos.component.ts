import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-datos',
  imports: [],
  templateUrl: './datos.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatosComponent { }

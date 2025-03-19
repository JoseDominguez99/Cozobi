import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-selection',
  imports: [],
  templateUrl: './selection.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionComponent { }

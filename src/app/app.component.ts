import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
imports: [RouterOutlet ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ] // Esto es para que funcione el routerOutlet en Angular 13.0.0 o superior. Por defecto, se ignora este schema.
})
export class AppComponent implements OnInit {
  title = 'Cozobi';

  ngOnInit():void {

  }
}

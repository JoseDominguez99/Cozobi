import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';


@Component({
  selector: 'app-plantas',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './plantas.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlantasComponent implements OnInit{
  private firestore: Firestore = inject(Firestore);
  plantas$: Observable<any[]>;

  constructor() {
    const plantasCollection = collection(this.firestore, 'Plantas');
    this.plantas$ = collectionData(plantasCollection, { idField: 'id' });
  }

  ngOnInit() {
    this.plantas$.subscribe(plantas => {
      console.log('Datos de plantas:', plantas);
    });
  }
  
}

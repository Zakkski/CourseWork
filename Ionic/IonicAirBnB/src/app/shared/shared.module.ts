import { NgModule } from '@angular/core';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [LocationPickerComponent, MapModalComponent],
    exports: [LocationPickerComponent, MapModalComponent],
    // For using ng-if and such commonModule
    imports: [CommonModule, IonicModule],
    entryComponents: [MapModalComponent]
})
export class SharedModule { }

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { getLocaleDateFormat } from '@angular/common';
import { PlaceLocation, Coordinates } from 'src/app/places/location.model';
import { of } from 'rxjs';
import { Plugins, Capacitor } from '@capacitor/core';

@Component({
    selector: 'app-location-picker',
    templateUrl: './location-picker.component.html',
    styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
    selectedLocationImage: string;
    isLoading = false;
    @Output() locationPick = new EventEmitter<PlaceLocation>();

    constructor(private modalCtrl: ModalController, private http: HttpClient, private actionSheetController: ActionSheetController, private alertCtrl: AlertController) { }

    ngOnInit() { }


    onPickLocation() {
        this.actionSheetController.create({
            header: 'Please Choose', buttons: [
                { text: 'Auto-Locate', handler: () => { this.locateUser(); } },
                { text: 'Pick on Map', handler: () => { this.openMap(); } },
                { text: 'Cancel', role: 'cancel' }
            ]
        }).then(actionSheetEl => {
            actionSheetEl.present();
        });


    }

    private locateUser() {
        if (!Capacitor.isPluginAvailable('Geolocation')) {
            this.showErrorAlert();
            return;
        }
        Plugins.Geolocation.getCurrentPosition().then(position => {
            const coordinates: Coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
        }).catch(err => {
            this.showErrorAlert();
        });
    }

    private showErrorAlert() {
        this.alertCtrl.create({ header: 'Could not fetch location', message: 'Please use the map to pick a location!' })
            .then(el => {
                el.present();
            });
    }

    private openMap() {
        this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
            modalEl.onDidDismiss().then(data => {
                if (!data.data) {
                    return;
                }
                const pickedLocation: PlaceLocation = {
                    lat: data.data.lat,
                    lng: data.data.lng,
                    address: null,
                    staticMapImageUrl: null
                };
                this.isLoading = true;
                this.getAddress(data.data.lat, data.data.lng).pipe(switchMap(address => {
                    pickedLocation.address = address;
                    return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
                })).subscribe(staticMapImageUrl => {
                    pickedLocation.staticMapImageUrl = staticMapImageUrl;
                    this.selectedLocationImage = staticMapImageUrl;
                    this.isLoading = false;
                    this.locationPick.emit(pickedLocation);
                });
            });
            modalEl.present();
        });
    }

    private getAddress(lat: number, lng: number) {
        return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`)
            .pipe(map((geoData: any) => {
                if (!geoData || !geoData.results || geoData.results.lenght === 0) {
                    return null;
                }
                return geoData.results[0].formatted_address;
            }));
    }

    private getMapImage(lat: number, lng: number, zoom: number) {
        return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap&markers=color:red%7Clabel:PlaceC%7C${lat},${lng}&key=${environment.googleMapsAPIKey}`;
    }
}

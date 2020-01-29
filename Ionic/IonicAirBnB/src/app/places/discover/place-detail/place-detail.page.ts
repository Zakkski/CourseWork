import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
    place: Place;
    private placeSub: Subscription;

  constructor(
            private navCtrl: NavController,
            private route: ActivatedRoute,
            private placesService: PlacesService,
            private modalCtrl: ModalController,
            private actionSheetController: ActionSheetController,
            private bookingService: BookingService,
            private loadingCtrl: LoadingController) { }

  ngOnInit() {
      this.route.paramMap.subscribe(paramMap => {
          if (!paramMap.has('placeId')) {
              this.navCtrl.navigateBack('/places/tabs/discover');
              return;
          }

          this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
              this.place = place;
          });
      });
  }

  ngOnDestroy() {
      if (this.placeSub) {
          this.placeSub.unsubscribe()
      }
  }

  onBookPlace() {
      // makes ure that animation is correct
      //   this.navCtrl.navigateBack('/places/tabs/discover');
      // Wouldn't work if stack of pages is empty
      //   this.navCtrl.pop();
      // this.router.navigateByUrl('/places/tabs/discover')
      this.actionSheetController.create({
          header: 'Choose an Action',
          buttons: [
              {
                  text: 'Select Date',
                  handler: () => {
                      this.openBookingModal('select');
                  }
              },
              {
                  text: 'Random Date',
                  handler: () => {
                      this.openBookingModal('random');
                  }
              },
              {
                  text: 'Cancel',
                  role: 'cancel'
              }
          ]
      }).then(actionSheetEl => actionSheetEl.present());
  }

  openBookingModal(mode: 'select' | 'random') {
      console.log(mode);
      this.modalCtrl.create({
          component: CreateBookingComponent,
          componentProps: { selectedPlace: this.place, selectedMode: mode }
      }).then(element => {
          element.present();
          return element.onDidDismiss();
      })
          .then(resultData => {
              if (resultData.role === 'confirm') {
                  this.loadingCtrl.create({
                      message: 'Booking place...'
                  }).then(loadingEl => {
                    loadingEl.present();
                      const data = resultData.data.bookingData;
                      this.bookingService.addBooking(this.place.id, this.place.title, this.place.imageUrl, data.firstName, data.lastName, data.guestNumber, data.startDate, data.endDate).subscribe(() => {
                          loadingEl.dismiss();
                      })
                  })
              }
          });
  }

}

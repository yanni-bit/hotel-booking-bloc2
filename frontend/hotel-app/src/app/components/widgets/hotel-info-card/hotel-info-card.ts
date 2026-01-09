import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-info-card',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hotel-info-card.html',
  styleUrl: './hotel-info-card.scss'
})
export class HotelInfoCard {
  @Input() hotel: any;
}
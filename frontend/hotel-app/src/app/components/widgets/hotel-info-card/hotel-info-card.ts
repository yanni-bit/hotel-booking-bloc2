import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotel-info-card',
  imports: [CommonModule],
  templateUrl: './hotel-info-card.html',
  styleUrl: './hotel-info-card.scss'
})
export class HotelInfoCard {
  @Input() hotel: any;
}
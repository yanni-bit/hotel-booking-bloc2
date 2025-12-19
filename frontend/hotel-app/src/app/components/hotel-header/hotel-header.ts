import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotel-header',
  imports: [CommonModule],
  templateUrl: './hotel-header.html',
  styleUrl: './hotel-header.scss'
})
export class HotelHeader {
  @Input() hotel: any;
}
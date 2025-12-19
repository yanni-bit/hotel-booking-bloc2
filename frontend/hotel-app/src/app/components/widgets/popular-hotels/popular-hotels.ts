import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popular-hotels',
  imports: [CommonModule],
  templateUrl: './popular-hotels.html',
  styleUrl: './popular-hotels.scss'
})
export class PopularHotels {
  @Input() city: string = '';
}
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-popular-hotels',
  imports: [CommonModule, TranslateModule],
  templateUrl: './popular-hotels.html',
  styleUrl: './popular-hotels.scss'
})
export class PopularHotels {
  @Input() city: string = '';
}
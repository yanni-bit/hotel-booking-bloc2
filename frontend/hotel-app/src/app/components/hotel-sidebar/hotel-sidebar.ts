import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotel-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './hotel-sidebar.html',
  styleUrl: './hotel-sidebar.scss'
})
export class HotelSidebar {}
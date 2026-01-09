import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-criteres',
  imports: [CommonModule, TranslateModule],
  templateUrl: './criteres.html',
  styleUrl: './criteres.scss',
})
export class Criteres {

  criteres = [
    { id: 1, titleKey: 'criteres.hotel.title', textKey: 'criteres.hotel.text' },
    { id: 2, titleKey: 'criteres.descriptions.title', textKey: 'criteres.descriptions.text' },
    { id: 3, titleKey: 'criteres.knowledge.title', textKey: 'criteres.knowledge.text' },
    { id: 4, titleKey: 'criteres.service.title', textKey: 'criteres.service.text' },
    { id: 5, titleKey: 'criteres.price.title', textKey: 'criteres.price.text' },
    { id: 6, titleKey: 'criteres.secure.title', textKey: 'criteres.secure.text' },
    { id: 7, titleKey: 'criteres.benefits.title', textKey: 'criteres.benefits.text' },
    { id: 8, titleKey: 'criteres.questions.title', textKey: 'criteres.questions.text' }
  ];
}
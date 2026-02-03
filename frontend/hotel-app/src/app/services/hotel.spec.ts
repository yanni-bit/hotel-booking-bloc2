// ============================================
// FICHIER : hotel.spec.ts
// DESCRIPTION : Fichier de tests unitaires pour le service HotelService.
//               Vérifie que le service est correctement créé et injectable.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES TESTÉS : HotelService
// TESTS :
//   - Vérification de la création/injection du service
// ============================================

import { TestBed } from '@angular/core/testing';

import { HotelService } from './hotel';

/** Suite de tests pour le service HotelService */
describe('HotelService', () => {
  /** Instance du service à tester */
  let service: HotelService;

  /** Configuration du module de test avant chaque test */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotelService);
  });

  /** Test : le service doit être créé sans erreur */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

// ============================================
// FICHIER : reservation.spec.ts
// DESCRIPTION : Fichier de tests unitaires pour le service ReservationService.
//               Vérifie que le service est correctement créé et injectable.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES TESTÉS : ReservationService
// TESTS :
//   - Vérification de la création/injection du service
// ============================================

import { TestBed } from '@angular/core/testing';

import { ReservationService } from './reservation';

/** Suite de tests pour le service ReservationService */
describe('ReservationService', () => {
  /** Instance du service à tester */
  let service: ReservationService;

  /** Configuration du module de test avant chaque test */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservationService);
  });

  /** Test : le service doit être créé sans erreur */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

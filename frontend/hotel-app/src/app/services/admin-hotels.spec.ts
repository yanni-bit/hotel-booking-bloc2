// ============================================
// FICHIER : admin-hotels.spec.ts
// DESCRIPTION : Fichier de tests unitaires pour le service HotelAdminService.
//               Vérifie que le service est correctement créé et injectable.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES TESTÉS : HotelAdminService
// TESTS :
//   - Vérification de la création/injection du service
// ============================================

import { TestBed } from '@angular/core/testing';

import { HotelAdminService } from './admin-hotels';

/** Suite de tests pour le service HotelAdminService */
describe('HotelAdminService', () => {
  /** Instance du service à tester */
  let service: HotelAdminService;

  /** Configuration du module de test avant chaque test */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotelAdminService);
  });

  /** Test : le service doit être créé sans erreur */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

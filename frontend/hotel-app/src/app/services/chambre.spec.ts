// ============================================
// FICHIER : chambre.spec.ts
// DESCRIPTION : Fichier de tests unitaires pour le service ChambreService.
//               Vérifie que le service est correctement créé et injectable.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES TESTÉS : ChambreService
// TESTS :
//   - Vérification de la création/injection du service
// ============================================

import { TestBed } from '@angular/core/testing';

import { ChambreService } from './chambre';

/** Suite de tests pour le service ChambreService */
describe('ChambreService', () => {
  /** Instance du service à tester */
  let service: ChambreService;

  /** Configuration du module de test avant chaque test */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChambreService);
  });

  /** Test : le service doit être créé sans erreur */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

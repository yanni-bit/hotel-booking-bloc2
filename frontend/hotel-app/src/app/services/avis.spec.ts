// ============================================
// FICHIER : avis.spec.ts
// DESCRIPTION : Fichier de tests unitaires pour le service AvisService.
//               Vérifie que le service est correctement créé et injectable.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES TESTÉS : AvisService
// TESTS :
//   - Vérification de la création/injection du service
// ============================================

import { TestBed } from '@angular/core/testing';

import { AvisService } from './avis';

/** Suite de tests pour le service AvisService */
describe('AvisService', () => {
  /** Instance du service à tester */
  let service: AvisService;

  /** Configuration du module de test avant chaque test */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvisService);
  });

  /** Test : le service doit être créé sans erreur */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

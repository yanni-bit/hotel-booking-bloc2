// ============================================
// FICHIER : destination.spec.ts
// DESCRIPTION : Fichier de tests unitaires pour le service DestinationService.
//               Vérifie que le service est correctement créé et injectable.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES TESTÉS : DestinationService
// TESTS :
//   - Vérification de la création/injection du service
// ============================================

import { TestBed } from '@angular/core/testing';

import { DestinationService } from './destination';

/** Suite de tests pour le service DestinationService */
describe('DestinationService', () => {
  /** Instance du service à tester */
  let service: DestinationService;

  /** Configuration du module de test avant chaque test */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DestinationService);
  });

  /** Test : le service doit être créé sans erreur */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
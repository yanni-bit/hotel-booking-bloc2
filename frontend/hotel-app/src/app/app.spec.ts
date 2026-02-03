// ============================================
// FICHIER : app.spec.ts
// DESCRIPTION : Fichier de tests unitaires pour le composant racine App.
//               Vérifie la création du composant et le rendu du titre.
// AUTEUR : Yannick
// DATE : 2025
// COMPOSANTS TESTÉS : App (composant racine)
// TESTS :
//   - Vérification de la création du composant
//   - Vérification du rendu du titre dans le template
// ============================================

import { TestBed } from '@angular/core/testing';
import { App } from './app';

/** Suite de tests pour le composant racine App */
describe('App', () => {
  /** Configuration du module de test avant chaque test */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  /** Test : le composant doit être créé sans erreur */
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  /** Test : le template doit afficher le titre 'Hello, hotel-app' */
  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, hotel-app');
  });
});

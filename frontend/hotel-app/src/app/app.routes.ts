import { Routes } from '@angular/router';
import { Home } from './components/home/home';

export const routes: Routes = [
  { path: '', component: Home },  // Page d'accueil
  { path: '**', redirectTo: '' }  // Redirection si route inconnue
];

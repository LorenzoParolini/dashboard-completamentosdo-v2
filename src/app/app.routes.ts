import { Routes } from '@angular/router';
import { Regioni } from './components/regioni/regioni';
import { Main } from './components/main/main';
import { Clienti } from './components/clienti/clienti';
import { Ambienti } from './components/ambienti/ambienti';
import { SoftwareComponent } from './components/software/software';

export const routes: Routes = [
    { path: '',  component: Main },

    { path: 'home', component: Main },
    { path: 'regione', component: Regioni },
    { path: 'cliente', component: Clienti },
    { path: 'ambiente', component: Ambienti },
    { path: 'software', component: SoftwareComponent },
    
    { path: '**', redirectTo: '' }
];

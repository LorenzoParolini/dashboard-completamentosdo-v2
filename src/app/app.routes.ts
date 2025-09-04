import { Routes } from '@angular/router';
import { RegioniComponent } from './components/regioni/regioni.component';
import { MainComponent } from './components/main/main.component';
import { ClientiComponent } from './components/clienti/clienti.component';
import { AmbientiComponent } from './components/ambienti/ambienti.component';
import { SoftwareComponent } from './components/software/software.component';

export const routes: Routes = [
    { path: '',  component: MainComponent },

    { path: 'home', redirectTo: '' },
    { path: 'regione', component: RegioniComponent },
    { path: 'cliente', component: ClientiComponent },
    { path: 'ambiente', component: AmbientiComponent },
    { path: 'software', component: SoftwareComponent },
    
    { path: '**', redirectTo: '' }
];

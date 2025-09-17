import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeKey = 'darkTheme';
  private darkThemeSubject: BehaviorSubject<boolean>;
  
  public darkTheme$: Observable<boolean>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Inizializza il BehaviorSubject dopo che platformId è disponibile
    const initialTheme = this.loadThemeFromStorage();
    this.darkThemeSubject = new BehaviorSubject<boolean>(initialTheme);
    this.darkTheme$ = this.darkThemeSubject.asObservable();
    
    // Applica il tema al caricamento dell'applicazione solo nel browser
    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme(initialTheme);
    }
  }

  /**
   * Toggle del tema scuro
   */
  toggleTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const currentTheme = this.darkThemeSubject.value;
    const newTheme = !currentTheme;
    
    console.log('Theme toggle:', { currentTheme, newTheme }); // Debug
    
    this.darkThemeSubject.next(newTheme);
    this.applyTheme(newTheme);
    this.saveThemeToStorage(newTheme);
  }

  /**
   * Imposta un tema specifico
   */
  setTheme(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    console.log('Setting theme to:', isDark); // Debug
    
    this.darkThemeSubject.next(isDark);
    this.applyTheme(isDark);
    this.saveThemeToStorage(isDark);
  }

  /**
   * Ottiene lo stato attuale del tema
   */
  isDarkTheme(): boolean {
    return this.darkThemeSubject.value;
  }

  /**
   * Applica il tema al documento
   */
  private applyTheme(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  /**
   * Carica il tema dal localStorage
   */
  private loadThemeFromStorage(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Loading theme: server-side, using default false'); // Debug
      return false; // Default per il server
    }
    
    try {
      const stored = localStorage.getItem(this.darkThemeKey);
      console.log('Loading theme from localStorage:', stored); // Debug
      
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        console.log('Parsed theme:', parsed); // Debug
        return parsed;
      }
      
      // Fallback: rileva preferenza del sistema
      const systemPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('Using system preference:', systemPreference); // Debug
      return systemPreference;
    } catch (error) {
      console.error('Error loading theme from storage:', error); // Debug
      return false;
    }
  }

  /**
   * Salva il tema nel localStorage
   */
  private saveThemeToStorage(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      console.log('Saving theme to localStorage:', isDark); // Debug
      localStorage.setItem(this.darkThemeKey, JSON.stringify(isDark));
      
      // Verifica che sia stato salvato correttamente
      const verification = localStorage.getItem(this.darkThemeKey);
      console.log('Theme saved verification:', verification); // Debug
    } catch (error) {
      console.error('Error saving theme to storage:', error); // Debug
    }
  }
}
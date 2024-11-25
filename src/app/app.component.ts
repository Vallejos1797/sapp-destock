import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
    imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Corrección aquí
})
export class AppComponent implements  OnInit{
  title = 'super-meatboy-front';
  isOffline: boolean = false; // Estado de conexión

  checkConnection() {
    this.isOffline = !navigator.onLine; // Establecer el estado inicial
  }

  ngOnInit(): void {
    this.checkConnection(); // Verifica el estado inicial
    this.listenConnectionChanges(); // Escucha los cambios de conexión

  }
  listenConnectionChanges() {
    window.addEventListener('online', () => this.isOffline = false);
    window.addEventListener('offline', () => this.isOffline = true);
  }
}

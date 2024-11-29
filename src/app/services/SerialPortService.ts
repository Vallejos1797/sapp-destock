import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SerialPortService {
  private portsSubject = new BehaviorSubject<any[]>([]);
  private selectedPortSubject = new BehaviorSubject<string | null>(null);

  ports$ = this.portsSubject.asObservable();
  selectedPort$ = this.selectedPortSubject.asObservable();

  constructor() {}

  // Actualiza la lista de puertos y selecciona automáticamente el primero
  setPorts(ports: any[]) {
    this.portsSubject.next(ports);
    if (ports.length > 0) {
      this.setSelectedPort(ports[0].path); // Selecciona automáticamente el primer puerto
    }
  }

  setSelectedPort(port: string | null) {
    this.selectedPortSubject.next(port ?? ''); // Si es null, usa un string vacío como valor por defecto
  }

  // Obtiene los puertos y el puerto seleccionado
  getPorts() {
    return this.portsSubject.value;
  }

  getSelectedPort() {
    return this.selectedPortSubject.value;
  }
}

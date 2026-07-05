import * as salonesApi from '../api/salonesApi.js';

class UseSalones {
  constructor() {
    this.salones = [];
    this.cargando = false;
    this.error = null;
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this));
  }

  async fetchSalones() {
    this.cargando = true;
    this.error = null;
    this.notify();

    try {
      this.salones = await salonesApi.obtenerSalones();
    } catch (error) {
      this.error = error.message;
      console.error(error);
    } finally {
      this.cargando = false;
      this.notify();
    }
  }

  getFiltered(query = '', piso = '', condicion = '') {
    return this.salones.filter(salon => {
      const q = query.toLowerCase();
      const matchQuery = salon.nombre.toLowerCase().includes(q) || 
                         (salon.codigo && salon.codigo.toLowerCase().includes(q)) ||
                         salon.ubicacion.toLowerCase().includes(q);
      const matchPiso = piso === '' || String(salon.piso) === String(piso);
      const matchCondicion = condicion === '' || salon.condicion === condicion;
      return matchQuery && matchPiso && matchCondicion;
    });
  }
}

export const useSalones = new UseSalones();

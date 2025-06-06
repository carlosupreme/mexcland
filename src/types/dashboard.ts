
export interface Lectura {
  id: string;
  temperatura: number | null;
  pH: number | null;
  humedad: number | null;
  nivel_liquido: number | null;
  created_at: string;
  sensor_id: string;
}

export interface LecturaConTina extends Lectura {
  tina_nombre: string;
}

export interface Tina {
  id: string;
  nombre: string;
  sensor_id: string | null;
}

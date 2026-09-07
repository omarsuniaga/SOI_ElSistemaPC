import React from 'react';
import { FileWarning } from 'lucide-react';

/**
 * Muestra en las vistas que aún no tienen tabla propia en Supabase (Cuentas
 * por Pagar, Nómina, Presupuesto, Servicios Fijos, Caja Diaria, Bancos,
 * Contabilidad, Tareas, Lutería). Sin este aviso, estas pantallas son
 * visualmente indistinguibles de las que sí escriben en la base de datos
 * institucional (Registro de Pago, Familias, Cuotas, Mora, Becas) — ver
 * CanonicalManifest.ts, donde `asientos_contables` ya está marcado
 * RESOURCE_NOT_MAPPED.
 */
export const DraftOnlyBanner: React.FC = () => (
  <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2.5 text-xs text-amber-200">
    <FileWarning className="w-4 h-4 text-amber-400 shrink-0" />
    <span>
      <span className="font-semibold">Borrador local:</span> esta sección todavía no tiene una tabla
      propia en la base de datos institucional. Lo que captures aquí se guarda solo en este
      navegador y no es visible para el resto del equipo ni sobrevive a un cambio de dispositivo.
    </span>
  </div>
);

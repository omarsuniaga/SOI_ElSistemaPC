import { IFamilyRepository, IFeeRepository, IPaymentRepository } from '../../application/ports/IReceivablesRepositories';
import { Family } from '../../domain/entities/Family';
import { Fee } from '../../domain/entities/Fee';
import { Payment } from '../../domain/entities/Payment';
import { Money } from '../../domain/value-objects/Money';
import { supabaseRest, supabaseRpc } from './SupabaseRestClient';
import { Database } from './database.types';

type FamiliaRow = Database['public']['Tables']['familias']['Row'];
type AlumnoRow = Database['public']['Tables']['alumnos']['Row'];
type CuotaRow = Database['public']['Tables']['cuotas']['Row'];
type PagoRow = Database['public']['Tables']['pagos']['Row'];

export class SupabaseFamilyRepository implements IFamilyRepository {
  public async findById(id: string): Promise<Family | null> {
    const familias = await supabaseRest<FamiliaRow[]>(`familias?id=eq.${id}&select=*`);
    if (!familias || familias.length === 0) return null;
    
    const familia = familias[0];
    const alumnos = await supabaseRest<AlumnoRow[]>(`alumnos?familia_id=eq.${id}&select=*`);
    return this.mapToDomain(familia, alumnos);
  }

  public async findAll(params?: { limit?: number; offset?: number }): Promise<Family[]> {
    const limit = params?.limit || 100;
    const offset = params?.offset || 0;
    
    const [familias, alumnos] = await Promise.all([
      supabaseRest<FamiliaRow[]>(`familias?select=*&order=nombre_familia.asc&limit=${limit}&offset=${offset}`),
      supabaseRest<AlumnoRow[]>(`alumnos?select=*&limit=500`)
    ]);

    const alumnosByFamily = new Map<string, AlumnoRow[]>();
    for (const al of alumnos) {
      if (al.familia_id) {
        const list = alumnosByFamily.get(al.familia_id) || [];
        list.push(al);
        alumnosByFamily.set(al.familia_id, list);
      }
    }

    return familias.map(f => this.mapToDomain(f, alumnosByFamily.get(f.id || '') || []));
  }

  public async save(family: Family): Promise<void> {
    await supabaseRest(`familias?id=eq.${family.id}`, {
      method: 'PATCH',
      body: {
        nombre_familia: family.apellidos,
        activa: family.activa,
        updated_at: new Date().toISOString()
      }
    });
  }

  private mapToDomain(f: FamiliaRow, alumnos: AlumnoRow[]): Family {
    const rep = alumnos[0];
    const repNombre = rep?.representante_nombre || rep?.padre_nombre || rep?.madre_nombre || 'Representante Legal';
    const repCedula = rep?.representante_cedula || rep?.padre_cedula || rep?.madre_cedula || '';
    const repTlf = rep?.representante_tlf || rep?.padre_tlf_whatsapp || rep?.madre_tlf_whatsapp || '';
    const repCorreo = rep?.correo_representante || '';

    const hasMora = alumnos.some(a => a.mora_flag);

    return new Family({
      id: f.id || '',
      apellidos: f.nombre_familia || 'Familia',
      representanteId: rep?.id || undefined,
      representanteNombre: repNombre,
      representanteCedula: repCedula,
      representanteTelefono: repTlf,
      representanteCorreo: repCorreo,
      saldoPendiente: Money.zero(), // Derived dynamically from real Cuotas
      creditoFavor: Money.zero(),
      alumnosCount: alumnos.length,
      alumnosNombres: alumnos.map(a => a.nombre_completo || 'Estudiante'),
      alumnosIds: alumnos.map(a => a.id || ''),
      estadoCartera: hasMora ? 'mora_temprana' : 'al_dia',
      activa: f.activa ?? true,
      createdAt: f.created_at || undefined,
      updatedAt: f.updated_at || undefined
    });
  }
}

export class SupabaseFeeRepository implements IFeeRepository {
  public async findById(id: string): Promise<Fee | null> {
    const rows = await supabaseRest<CuotaRow[]>(`cuotas?id=eq.${id}&select=*`);
    if (!rows || rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  public async findByFamilyId(familyId: string): Promise<Fee[]> {
    const rows = await supabaseRest<CuotaRow[]>(`cuotas?familia_id=eq.${familyId}&select=*&order=fecha_vencimiento.asc`);
    return rows.map(r => this.mapToDomain(r));
  }

  public async findAll(params?: { periodo?: string; limit?: number; offset?: number }): Promise<Fee[]> {
    const limit = params?.limit || 200;
    const offset = params?.offset || 0;
    let query = `cuotas?select=*&order=fecha_vencimiento.desc&limit=${limit}&offset=${offset}`;
    if (params?.periodo) {
      const [anio, mes] = params.periodo.split('-');
      if (anio && mes) {
        query += `&ciclo_anio=eq.${anio}&ciclo_mes=eq.${parseInt(mes, 10)}`;
      }
    }
    const rows = await supabaseRest<CuotaRow[]>(query);
    return rows.map(r => this.mapToDomain(r));
  }

  public async saveMany(fees: Fee[]): Promise<void> {
    for (const fee of fees) {
      await supabaseRest(`cuotas?id=eq.${fee.id}`, {
        method: 'PATCH',
        body: {
          monto_pagado_centavos: fee.montoPagado.cents,
          estado: fee.estado,
          updated_at: new Date().toISOString()
        }
      });
    }
  }

  private mapToDomain(c: CuotaRow): Fee {
    return new Fee({
      id: c.id || '',
      familiaId: c.familia_id || '',
      alumnoId: c.alumno_id || '',
      concepto: c.concepto || 'Mensualidad',
      montoBase: Money.fromCents(c.monto_base_centavos || 0),
      descuento: Money.fromCents(c.descuento_centavos || 0),
      montoNeto: Money.fromCents(c.monto_final_centavos || 0),
      montoPagado: Money.fromCents(c.monto_pagado_centavos || 0),
      fechaGeneracion: c.fecha_generacion || new Date().toISOString().split('T')[0],
      fechaVencimiento: c.fecha_vencimiento || new Date().toISOString().split('T')[0],
      estado: (c.estado as any) || 'pendiente',
      cicloMes: c.ciclo_mes || 1,
      cicloAnio: c.ciclo_anio || 2026,
      periodo: `${c.ciclo_anio || 2026}-${String(c.ciclo_mes || 1).padStart(2, '0')}`,
      metadatos: c.metadatos || {}
    });
  }
}

export class SupabasePaymentRepository implements IPaymentRepository {
  public async findById(id: string): Promise<Payment | null> {
    const rows = await supabaseRest<PagoRow[]>(`pagos?id=eq.${id}&select=*`);
    if (!rows || rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  public async findByFamilyId(familyId: string): Promise<Payment[]> {
    const rows = await supabaseRest<PagoRow[]>(`pagos?familia_id=eq.${familyId}&select=*&order=created_at.desc`);
    return rows.map(r => this.mapToDomain(r));
  }

  public async findAll(params?: { limit?: number; offset?: number }): Promise<Payment[]> {
    const limit = params?.limit || 100;
    const offset = params?.offset || 0;
    const rows = await supabaseRest<PagoRow[]>(`pagos?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`);
    return rows.map(r => this.mapToDomain(r));
  }

  public async getNextReceiptNumber(): Promise<string> {
    // Generate sequential or timestamped receipt code
    const countRes = await supabaseRest<{ count: number }[]>(`pagos?select=count`, { prefer: 'count=exact' });
    const seq = (countRes && countRes[0] ? (countRes as any).length : 1) + 1001;
    return `REC-${seq.toString().padStart(8, '0')}`;
  }

  private mapToDomain(p: PagoRow): Payment {
    return new Payment({
      id: p.id || '',
      numeroRecibo: p.referencia || `REC-${p.id?.slice(0, 8)}`,
      familiaId: p.familia_id || '',
      montoTotal: Money.fromCents(p.monto_centavos || 0),
      creditoGenerado: Money.zero(),
      fechaPago: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      fechaRegistro: p.created_at || new Date().toISOString(),
      metodoPago: (p.metodo_pago as any) || 'efectivo',
      referenciaBancaria: p.referencia || undefined,
      estado: 'confirmado',
      registradoPor: p.cajero_id || 'cajero-principal',
      aplicaciones: [],
      observaciones: p.notas || undefined,
      reciboUrl: p.recibo_url || undefined
    });
  }
}

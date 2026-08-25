import { ProtocolPreviewDTO } from '../dtos/OperationalHealthDTO';

export class GenerateProtocolPreview {
  async execute(processCode: string, targetDate: string): Promise<ProtocolPreviewDTO> {
    if (processCode === 'ADM-P01' || processCode.includes('ADM')) {
      return {
        processCode: 'ADM-P01',
        processName: 'Protocolo Institucional de Reinscripciones Regulares',
        targetDate,
        estimatedDurationDays: 21,
        participatingDepartments: ['ADM', 'FIN', 'COM', 'AGT'],
        proposedTasks: [
          { title: 'T-21: Cierre y conciliación de actas académicas', department: 'ACM', ownerRole: 'Coordinación Académica', offsetDays: -21, priority: 'HIGH', evidenceRequired: true },
          { title: 'T-14: Auditoría de elegibilidad financiera y solvencia', department: 'FIN', ownerRole: 'Oficial de Cobranzas', offsetDays: -14, priority: 'HIGH', evidenceRequired: true },
          { title: 'T-7: Campaña de comunicación omnicanal a familias', department: 'COM', ownerRole: 'Líder de Comunicaciones', offsetDays: -7, priority: 'NORMAL', evidenceRequired: false },
          { title: 'T0: Apertura formal de portal de matrícula', department: 'ADM', ownerRole: 'Registrador General', offsetDays: 0, priority: 'CRITICAL', evidenceRequired: true },
          { title: 'T+2: Primer reporte de avance y seguimiento a rezagados', department: 'AGT', ownerRole: 'Hermes Orchestration', offsetDays: 2, priority: 'NORMAL', evidenceRequired: false },
          { title: 'T+6: Gestión personalizada de casos especiales', department: 'ADM', ownerRole: 'Trabajo Social / Dirección', offsetDays: 6, priority: 'HIGH', evidenceRequired: true },
        ],
      };
    }

    // Default / Concert template (e.g. Concierto de Navidad)
    return {
      processCode: processCode || 'EVT-PXX',
      processName: 'Protocolo de Producción de Concierto Institucional',
      targetDate,
      estimatedDurationDays: 90,
      participatingDepartments: ['ACM', 'EVT', 'FIN', 'LOG', 'COM', 'DIR'],
      proposedTasks: [
        { title: 'T-90: Aprobación curatorial de repertorio y solistas', department: 'ACM', ownerRole: 'Director Musical', offsetDays: -90, priority: 'HIGH', evidenceRequired: true },
        { title: 'T-60: Reserva de sala y requerimiento técnico de riders', department: 'EVT', ownerRole: 'Jefe de Producción', offsetDays: -60, priority: 'HIGH', evidenceRequired: true },
        { title: 'T-45: Aprobación y desembolso de presupuesto de producción', department: 'FIN', ownerRole: 'Director Financiero', offsetDays: -45, priority: 'CRITICAL', evidenceRequired: true },
        { title: 'T-30: Lanzamiento de afiches, prensa y venta/reserva', department: 'COM', ownerRole: 'Comunicaciones', offsetDays: -30, priority: 'NORMAL', evidenceRequired: false },
        { title: 'T-21: Mantenimiento y luthería preventiva de instrumentos', department: 'LOG', ownerRole: 'Maestro Luther', offsetDays: -21, priority: 'HIGH', evidenceRequired: true },
        { title: 'T-15: Coordinación logística de transporte y refrigerios', department: 'LOG', ownerRole: 'Coordinador Logístico', offsetDays: -15, priority: 'HIGH', evidenceRequired: true },
        { title: 'T-7: Ensayo Tutti general con vestuario', department: 'ACM', ownerRole: 'Director Orquestal', offsetDays: -7, priority: 'CRITICAL', evidenceRequired: true },
        { title: 'T-3: Minuta protocolar de invitados y autoridades', department: 'DIR', ownerRole: 'Dirección Ejecutiva', offsetDays: -3, priority: 'NORMAL', evidenceRequired: true },
        { title: 'T0: Concierto y montaje de escenario', department: 'EVT', ownerRole: 'Producción General', offsetDays: 0, priority: 'CRITICAL', evidenceRequired: true },
        { title: 'T+1: Retorno seguro de instrumentos a custodia', department: 'LOG', ownerRole: 'Inventario', offsetDays: 1, priority: 'HIGH', evidenceRequired: true },
        { title: 'T+3: Liquidación de viáticos y comprobantes fiscales', department: 'FIN', ownerRole: 'Contabilidad', offsetDays: 3, priority: 'NORMAL', evidenceRequired: true },
      ],
    };
  }
}

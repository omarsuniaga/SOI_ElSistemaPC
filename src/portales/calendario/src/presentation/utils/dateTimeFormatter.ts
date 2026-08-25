export interface TimeZoneOption {
  id: string;
  name: string;
  city: string;
  region: string;
  offsetLabel: string;
  institutionRole: string;
}

export const INSTITUTIONAL_TIMEZONES: TimeZoneOption[] = [
  {
    id: 'America/Santo_Domingo',
    name: 'República Dominicana (Sede Central)',
    city: 'Punta Cana / Santo Domingo',
    region: 'Caribe',
    offsetLabel: 'AST (UTC-4)',
    institutionRole: 'Sede Principal FUNEYCA & Conservatorio Punta Cana',
  },
  {
    id: 'America/New_York',
    name: 'EE.UU. Costa Este / Donantes',
    city: 'Nueva York / Washington',
    region: 'Norteamérica',
    offsetLabel: 'EDT/EST (UTC-4/-5)',
    institutionRole: 'Coordinación Internacional, Filantropía & Becas',
  },
  {
    id: 'America/Caracas',
    name: 'Venezuela (Origen Metodológico)',
    city: 'Caracas',
    region: 'Sudamérica',
    offsetLabel: 'VET (UTC-4)',
    institutionRole: 'Dirección Musical Fundacional & Maestros Invitados',
  },
  {
    id: 'Europe/Madrid',
    name: 'España (Conservatorios Hermanos)',
    city: 'Madrid / Barcelona',
    region: 'Europa',
    offsetLabel: 'CEST/CET (UTC+2/+1)',
    institutionRole: 'Programas de Intercambio Académico & Pasantías',
  },
  {
    id: 'Europe/Paris',
    name: 'Francia / Suiza (Alianzas UNESCO)',
    city: 'París / Ginebra',
    region: 'Europa',
    offsetLabel: 'CEST/CET (UTC+2/+1)',
    institutionRole: 'Alianzas Culturales & Fondos de Cooperación',
  },
  {
    id: 'Europe/London',
    name: 'Reino Unido (Festivales)',
    city: 'Londres',
    region: 'Europa',
    offsetLabel: 'BST/GMT (UTC+1/0)',
    institutionRole: 'Coordinación de Giras Internacionales',
  },
  {
    id: 'America/Bogota',
    name: 'Colombia / Región Andina',
    city: 'Bogotá / Medellín',
    region: 'Sudamérica',
    offsetLabel: 'COT (UTC-5)',
    institutionRole: 'Red de Orquestas Juveniles Andinas',
  },
  {
    id: 'America/Mexico_City',
    name: 'México (Red Iberoamericana)',
    city: 'Ciudad de México',
    region: 'Norteamérica',
    offsetLabel: 'CST (UTC-6)',
    institutionRole: 'Festivales y Seminarios de Dirección',
  },
  {
    id: 'America/Buenos_Aires',
    name: 'Argentina (Cono Sur)',
    city: 'Buenos Aires',
    region: 'Sudamérica',
    offsetLabel: 'ART (UTC-3)',
    institutionRole: 'Capacitación Pedagógica y Repertorio Sinfónico',
  },
  {
    id: 'America/Los_Angeles',
    name: 'EE.UU. Costa Oeste',
    city: 'Los Ángeles / San Francisco',
    region: 'Norteamérica',
    offsetLabel: 'PDT/PST (UTC-7/-8)',
    institutionRole: 'Audio Engineering & Donantes Tecnológicos',
  },
  {
    id: 'UTC',
    name: 'Universal Coordinated Time',
    city: 'Referencia Global',
    region: 'Universal',
    offsetLabel: 'UTC (UTC+0)',
    institutionRole: 'Protocolos de Sincronización Estándar',
  },
];

export const DEFAULT_INSTITUTION_TIMEZONE = 'America/Santo_Domingo';

/**
 * Formats a date into a localized string with a specified timeZone
 */
export function formatInstitutionalDate(
  dateInput: string | number | Date,
  timeZone: string = DEFAULT_INSTITUTION_TIMEZONE,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Fecha no válida';

    const defaultOpts: Intl.DateTimeFormatOptions = {
      timeZone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat('es-DO', defaultOpts).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats time in a specific timeZone
 */
export function formatInstitutionalTime(
  dateInput: string | number | Date,
  timeZone: string = DEFAULT_INSTITUTION_TIMEZONE,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '--:--';

    const defaultOpts: Intl.DateTimeFormatOptions = {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options,
    };

    return new Intl.DateTimeFormat('es-DO', defaultOpts).format(d);
  } catch {
    return '--:--';
  }
}

/**
 * Formats full date and time in a specific timeZone
 */
export function formatInstitutionalDateTime(
  dateInput: string | number | Date,
  timeZone: string = DEFAULT_INSTITUTION_TIMEZONE,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Fecha no válida';

    const defaultOpts: Intl.DateTimeFormatOptions = {
      timeZone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options,
    };

    return new Intl.DateTimeFormat('es-DO', defaultOpts).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Helper to get current clock time in a timezone
 */
export function getCurrentTimeInZone(
  timeZone: string,
  hour12: boolean = false
): string {
  try {
    return new Intl.DateTimeFormat('es-DO', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12,
    }).format(new Date());
  } catch {
    return '00:00:00';
  }
}

/**
 * Get short offset description for a timeZone, e.g., 'GMT-4'
 */
export function getTimeZoneAbbr(timeZone: string): string {
  try {
    const found = INSTITUTIONAL_TIMEZONES.find(t => t.id === timeZone);
    if (found) return found.offsetLabel.split(' ')[0];

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(new Date());

    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : timeZone;
  } catch {
    return timeZone;
  }
}

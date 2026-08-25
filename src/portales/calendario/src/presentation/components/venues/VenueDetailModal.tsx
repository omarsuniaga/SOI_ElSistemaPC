import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../state/uiStore';
import { useAppContainer } from '../../context/AppContainerContext';
import { toast } from '../../state/toastStore';
import { Venue } from '../../../domain/venues/entities/Venue';
import {
  Building2,
  X,
  Users,
  Music2,
  MapPin,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

export const VenueDetailModal: React.FC = () => {
  const container = useAppContainer();
  const { selectedVenueId, closeVenueDetailModal, currentRole } = useUIStore();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [eventName, setEventName] = useState('');
  const [reserveDate, setReserveDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedVenueId) {
      container.getVenues.execute().then(venues => {
        const found = venues.find(v => v.id === selectedVenueId);
        setVenue(found || null);
        if (found) {
          setEventName(`Reserva para Ensayo General - ${found.name}`);
        }
      });
    }
  }, [selectedVenueId, container]);

  if (!selectedVenueId || !venue) return null;

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      toast.warning('Campo requerido', 'Por favor ingrese el motivo o nombre del evento.');
      return;
    }

    const perm = container.permissionService.checkPermission(currentRole, 'RESERVE_VENUE');
    if (!perm.allowed) {
      toast.error('Acción denegada por política de permisos', perm.reason);
      return;
    }

    try {
      setSubmitting(true);
      const startAtISO = `${reserveDate}T${startTime}:00Z`;
      const endAtISO = `${reserveDate}T${endTime}:00Z`;

      await container.reserveVenue.execute({
        venueId: venue.id,
        eventName: eventName.trim(),
        startAt: startAtISO,
        endAt: endAtISO,
        departmentOwner: 'PRD',
        ownerRole: 'Coordinador de Sala',
        notes,
      });

      toast.success(
        'Espacio Reservado con Éxito',
        `${venue.name} ha sido bloqueado para "${eventName}" el ${reserveDate} de ${startTime} a ${endTime}.`
      );
      setIsReserving(false);
      closeVenueDetailModal();
    } catch (err: any) {
      toast.error('Error al reservar sala', err?.message || 'Error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  const getVenueTypeLabel = (type: string) => {
    switch (type) {
      case 'CONCERT_HALL': return 'Sala de Concierto';
      case 'AUDITORIUM': return 'Auditorio';
      case 'CLASSROOM': return 'Aula de Cátedra';
      case 'REHEARSAL_ROOM': return 'Sala de Ensayo';
      case 'OUTDOOR': return 'Espacio Exterior';
      case 'ADMIN_BOARD': return 'Sala de Juntas';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 sm:p-7 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-zinc-100">{venue.name}</h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {getVenueTypeLabel(venue.type)}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-500" />
                {venue.address}
              </p>
            </div>
          </div>
          <button
            onClick={closeVenueDetailModal}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Aforo Máximo</span>
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-zinc-100">
                {venue.capacity} <span className="text-xs font-normal text-zinc-500">pax</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Music2 className="w-4 h-4 text-purple-400" />
                <span>Perfil Acústico</span>
              </div>
              <div className="mt-1 text-xs font-bold font-mono text-zinc-200 truncate" title={venue.acousticProfile}>
                {venue.acousticProfile}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Configuración</span>
              </div>
              <div className="mt-1 text-xs font-bold font-mono text-emerald-400">
                {venue.indoorOutdoor === 'INDOOR'
                  ? 'Interior Climatizado'
                  : venue.indoorOutdoor === 'OUTDOOR'
                  ? 'Espacio Abierto'
                  : 'Híbrido Modular'}
              </div>
            </div>
          </div>

          {/* Features Checklist */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider mb-2.5">
              Equipamiento & Características Técnicas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {venue.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 text-xs text-zinc-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {venue.notes && (
            <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/20 text-xs text-zinc-400 leading-relaxed font-sans">
              <span className="font-bold text-zinc-300 font-mono block mb-1">Notas Institucionales:</span>
              {venue.notes}
            </div>
          )}

          {/* Reservation Section */}
          {!isReserving ? (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-amber-300">
                  ¿Desea bloquear este espacio para un evento?
                </h4>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  Genera una reserva inmediata en el Calendario Maestro y previene solapamientos.
                </p>
              </div>
              <button
                onClick={() => setIsReserving(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-amber-950/20"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reservar Espacio</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleReserve} className="p-4 rounded-xl border border-amber-500/40 bg-zinc-900/80 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Formulario de Reserva Inmediata
                </span>
                <button
                  type="button"
                  onClick={() => setIsReserving(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 font-mono"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                  Nombre del Evento / Motivo de Reserva *
                </label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  placeholder="Ej: Ensayo General Orquesta Sinfónica Juvenil..."
                  className="w-full h-8 px-2.5 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={reserveDate}
                    onChange={e => setReserveDate(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Requerimientos o Notas</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej: Requiere 45 atriles y piano afinado..."
                  className="w-full h-8 px-2.5 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReserving(false)}
                  className="px-3 py-1.5 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold shadow-md shadow-amber-950/20"
                >
                  {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

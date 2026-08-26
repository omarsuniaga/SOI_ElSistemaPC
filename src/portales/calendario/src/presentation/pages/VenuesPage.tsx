import React, { useEffect, useState } from 'react';
import { useAppContainer } from '../context/AppContainerContext';
import { useUIStore } from '../state/uiStore';
import { Venue, VenueType } from '../../domain/venues/entities/Venue';
import {
  Building2,
  Users,
  Volume2,
  CheckCircle2,
  MapPin,
  Calendar,
  Search,
  Sparkles,
} from 'lucide-react';

export const VenuesPage: React.FC = () => {
  const container = useAppContainer();
  const { openVenueDetailModal, selectedVenueId } = useUIStore();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchVenues = () => {
    setLoading(true);
    container.getVenues
      .execute()
      .then(setVenues)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVenues();
  }, [selectedVenueId]);

  const filteredVenues = venues.filter(v => {
    if (selectedType !== 'ALL' && v.type !== selectedType) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.acousticProfile.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const venueTypes = [
    { id: 'ALL', label: 'Todos los espacios' },
    { id: 'CONCERT_HALL', label: 'Salas de Concierto' },
    { id: 'AUDITORIUM', label: 'Auditorios' },
    { id: 'CLASSROOM', label: 'Aulas de Cátedra' },
    { id: 'REHEARSAL_ROOM', label: 'Salas de Ensayo' },
    { id: 'OUTDOOR', label: 'Espacios Exteriores' },
    { id: 'ADMIN_BOARD', label: 'Salas de Juntas' },
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              Salas & Sedes Institucionales
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Directorio de {venues.length} espacios acústicos, aforos, equipamiento y reserva directa
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filtrar sala o acústica..."
            className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60 font-mono"
          />
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-zinc-800/80">
        {venueTypes.map(vt => (
          <button
            key={vt.id}
            onClick={() => setSelectedType(vt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              selectedType === vt.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            {vt.label}
          </button>
        ))}
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-16 text-xs font-mono text-zinc-500">
            Cargando inventario de salas...
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-xs font-mono text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-800">
            No se encontraron salas para el criterio seleccionado.
          </div>
        ) : (
          filteredVenues.map(v => {
            return (
              <div
                key={v.id}
                onClick={() => openVenueDetailModal(v.id)}
                className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3.5 hover:border-amber-500/50 hover:bg-zinc-800/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {getVenueTypeLabel(v.type)}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono text-amber-400 font-bold">
                      <Users className="w-3.5 h-3.5" />
                      <span>Aforo: {v.capacity} pax</span>
                    </div>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-zinc-100 font-mono group-hover:text-amber-400 transition-colors">
                    {v.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{v.address}</span>
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-xs">
                  {/* Acoustic Profile */}
                  <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{v.acousticProfile}</span>
                  </div>

                  {/* Features tags */}
                  {v.features && v.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {v.features.slice(0, 3).map((f, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 text-[10px] font-mono"
                        >
                          {f}
                        </span>
                      ))}
                      {v.features.length > 3 && (
                        <span className="px-1 py-0.5 text-zinc-500 text-[10px] font-mono">
                          +{v.features.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Disponible
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openVenueDetailModal(v.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold transition-all"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Detalles & Reservar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

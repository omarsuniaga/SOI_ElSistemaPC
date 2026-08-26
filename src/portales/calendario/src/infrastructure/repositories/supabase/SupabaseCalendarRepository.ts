import { CalendarRepository, CalendarFilterOptions } from '../../../domain/calendar/repositories/CalendarRepository';
import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';
import { SupabaseClient } from '@supabase/supabase-js';
import { CalendarItemMapper } from './mappers/CalendarItemMapper';

/**
 * SupabaseCalendarRepository (Adapter)
 *
 * Maps Supabase PostgreSQL table `calendario_institucional` into clean Domain
 * aggregates (CalendarItem) using the CalendarItemMapper.
 *
 * RLS Policy: The table has a policy `calendario_auth_all` that grants ALL
 * permissions to authenticated users. Queries will fail silently if the user
 * is not authenticated (out of scope; no login implemented yet).
 *
 * Server-side Trigger: After INSERT, the trigger `trg_hermes_event_inserted`
 * automatically invokes `fn_hermes_auto_delegar_tareas()` to create institutional
 * tasks based on protocol bindings. No frontend logic needed.
 */
export class SupabaseCalendarRepository implements CalendarRepository {
  private supabaseClient: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async findAll(filter?: CalendarFilterOptions): Promise<CalendarItem[]> {
    try {
      let query = this.supabaseClient
        .from('calendario_institucional')
        .select('*');

      // Apply filters if provided
      if (filter) {
        if (filter.department) {
          query = query.eq('departamento_responsable', filter.department);
        }
        if (filter.category) {
          query = query.eq('categoria', filter.category);
        }
        if (filter.status) {
          query = query.eq('estado', filter.status);
        }
        if (filter.venueId) {
          query = query.eq('venue_id', filter.venueId);
        }
        if (filter.startDate) {
          query = query.gte('fecha_fin', filter.startDate);
        }
        if (filter.endDate) {
          query = query.lte('fecha_inicio', filter.endDate);
        }
        if (filter.searchQuery) {
          // Note: Full-text search requires DB configuration; using simple ILIKE for now
          const searchPattern = `%${filter.searchQuery}%`;
          query = query.or(
            `titulo.ilike.${searchPattern},descripcion.ilike.${searchPattern},ubicacion.ilike.${searchPattern}`
          );
        }
      }

      // Order by start date ascending
      const { data, error } = await query.order('fecha_inicio', { ascending: true });

      if (error) {
        console.error('Error fetching calendar items:', error);
        throw error;
      }

      return (data || []).map(row => CalendarItemMapper.toDomain(row));
    } catch (error) {
      console.error('CalendarRepository.findAll error:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<CalendarItem | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('calendario_institucional')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error('Error fetching calendar item by id:', error);
        throw error;
      }

      return data ? CalendarItemMapper.toDomain(data) : null;
    } catch (error) {
      console.error('CalendarRepository.findById error:', error);
      throw error;
    }
  }

  async findByDateRange(start: string, end: string): Promise<CalendarItem[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('calendario_institucional')
        .select('*')
        .lte('fecha_inicio', end)
        .gte('fecha_fin', start)
        .order('fecha_inicio', { ascending: true });

      if (error) {
        console.error('Error fetching calendar items by date range:', error);
        throw error;
      }

      return (data || []).map(row => CalendarItemMapper.toDomain(row));
    } catch (error) {
      console.error('CalendarRepository.findByDateRange error:', error);
      throw error;
    }
  }

  async save(item: CalendarItem): Promise<void> {
    try {
      const row = CalendarItemMapper.toRow(item);

      // Presentation layers (e.g. CreateCalendarItemModal) generate a client-side
      // placeholder id like `item-event-<timestamp>` for brand-new items — a convention
      // that works fine against the mock repository but is not a valid `uuid` for the real
      // `calendario_institucional.id` column. Only treat the item as an existing row (UPDATE)
      // when its id is actually a UUID; otherwise let Postgres generate a real one on INSERT.
      const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);

      if (isRealUuid) {
        const { error } = await this.supabaseClient
          .from('calendario_institucional')
          .update(row)
          .eq('id', item.id);

        if (error) {
          console.error('Error updating calendar item:', error);
          throw error;
        }
      } else {
        // Insert new event (Supabase will auto-generate id)
        const { error } = await this.supabaseClient
          .from('calendario_institucional')
          .insert([row]);

        if (error) {
          console.error('Error inserting calendar item:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('CalendarRepository.save error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('calendario_institucional')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting calendar item:', error);
        throw error;
      }
    } catch (error) {
      console.error('CalendarRepository.delete error:', error);
      throw error;
    }
  }
}

import { VenueRepository } from '../../../domain/venues/repositories/VenueRepository';
import { Venue } from '../../../domain/venues/entities/Venue';
import { INITIAL_VENUES } from './mockData';

export class MockVenueRepository implements VenueRepository {
  private venues: Map<string, Venue> = new Map();

  constructor() {
    for (const data of INITIAL_VENUES) {
      this.venues.set(data.id, new Venue(data));
    }
  }

  async findAll(): Promise<Venue[]> {
    return Array.from(this.venues.values());
  }

  async findById(id: string): Promise<Venue | null> {
    return this.venues.get(id) ?? null;
  }

  async save(venue: Venue): Promise<void> {
    this.venues.set(venue.id, venue);
  }
}

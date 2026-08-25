import { Venue } from '../entities/Venue';

export interface VenueRepository {
  findAll(): Promise<Venue[]>;
  findById(id: string): Promise<Venue | null>;
  save(venue: Venue): Promise<void>;
}

import { VenueRepository } from '../../../domain/venues/repositories/VenueRepository';
import { Venue } from '../../../domain/venues/entities/Venue';

export class GetVenues {
  constructor(private venueRepo: VenueRepository) {}

  async execute(): Promise<Venue[]> {
    return this.venueRepo.findAll();
  }
}

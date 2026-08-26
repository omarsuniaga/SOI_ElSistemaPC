export type VenueType = 'CONCERT_HALL' | 'CLASSROOM' | 'REHEARSAL_ROOM' | 'OUTDOOR' | 'AUDITORIUM' | 'ADMIN_BOARD';

export interface VenueProps {
  id: string;
  name: string;
  type: VenueType;
  capacity: number;
  address: string;
  acousticProfile: string; // e.g. 'Sinfónica reverberante', 'Tratamiento acústico seco', 'Cámara'
  indoorOutdoor: 'INDOOR' | 'OUTDOOR' | 'HYBRID';
  features: string[];
  notes?: string;
}

export class Venue {
  readonly id: string;
  readonly name: string;
  readonly type: VenueType;
  readonly capacity: number;
  readonly address: string;
  readonly acousticProfile: string;
  readonly indoorOutdoor: 'INDOOR' | 'OUTDOOR' | 'HYBRID';
  readonly features: string[];
  readonly notes?: string;

  constructor(props: VenueProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.capacity = props.capacity;
    this.address = props.address;
    this.acousticProfile = props.acousticProfile;
    this.indoorOutdoor = props.indoorOutdoor;
    this.features = props.features;
    this.notes = props.notes;
  }

  toJSON(): VenueProps {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      capacity: this.capacity,
      address: this.address,
      acousticProfile: this.acousticProfile,
      indoorOutdoor: this.indoorOutdoor,
      features: this.features,
      notes: this.notes,
    };
  }
}

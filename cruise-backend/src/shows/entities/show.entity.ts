import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Ship } from '../../ships/entities/ship.entity';
import { Cruise } from '../../cruises/entities/cruise.entity';

@Entity('shows')
export class Show {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ship, { nullable: false })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @ManyToOne(() => Cruise, { nullable: false })
  @JoinColumn({ name: 'cruise_id' })
  cruise: Cruise;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, nullable: true })
  venue: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ name: 'show_date', type: 'date' })
  showDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'booked_count', type: 'int', default: 0 })
  bookedCount: number;

  @Column({ name: 'age_restriction', type: 'int', nullable: true, comment: 'min age, null means all ages' })
  ageRestriction: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'genre', length: 100, nullable: true })
  genre: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Cruise } from '../../cruises/entities/cruise.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cruise, { nullable: false })
  @JoinColumn({ name: 'cruise_id' })
  cruise: Cruise;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'duration_days', type: 'int' })
  durationDays: number;

  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  @Column({ type: 'jsonb', nullable: true })
  facilities: string[];

  @Column({ type: 'jsonb', nullable: true })
  itinerary: any[]; // Array of { day: number, title: string, desc: string }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

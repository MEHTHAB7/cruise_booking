import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Ship } from '../../ships/entities/ship.entity';
import { Port } from '../../ports/entities/port.entity';

export enum CruiseStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('cruises')
export class Cruise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @ManyToOne(() => Ship, { eager: true, nullable: false })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @ManyToOne(() => Port, { eager: true, nullable: false })
  @JoinColumn({ name: 'departure_port_id' })
  departurePort: Port;

  @ManyToOne(() => Port, { eager: true, nullable: false })
  @JoinColumn({ name: 'destination_port_id' })
  destinationPort: Port;

  @Column({ name: 'departure_date', type: 'date' })
  departureDate: Date;

  @Column({ name: 'return_date', type: 'date' })
  returnDate: Date;

  @Column({ name: 'duration_nights', type: 'int' })
  durationNights: number;

  @Column({ name: 'base_price_inside', type: 'decimal', precision: 10, scale: 2 })
  basePriceInside: number;

  @Column({ name: 'base_price_ocean_view', type: 'decimal', precision: 10, scale: 2 })
  basePriceOceanView: number;

  @Column({ name: 'base_price_balcony', type: 'decimal', precision: 10, scale: 2 })
  basePriceBalcony: number;

  @Column({ name: 'base_price_suite', type: 'decimal', precision: 10, scale: 2 })
  basePriceSuite: number;

  @Column({ type: 'enum', enum: CruiseStatus, default: CruiseStatus.ACTIVE })
  status: CruiseStatus;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ name: 'highlights', type: 'text', array: true, default: '{}' })
  highlights: string[];

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'ports_of_call', type: 'text', array: true, default: '{}' })
  portsOfCall: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

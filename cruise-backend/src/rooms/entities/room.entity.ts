import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Ship } from '../../ships/entities/ship.entity';

export enum RoomType {
  INSIDE = 'inside',
  OCEAN_VIEW = 'ocean_view',
  BALCONY = 'balcony',
  SUITE = 'suite',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  MAINTENANCE = 'maintenance',
  HOLDBACK = 'holdback',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ship, { nullable: false })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @Column({ name: 'room_number', length: 10 })
  roomNumber: string;

  @Column({ type: 'int' })
  deck: number;

  @Column({ type: 'enum', enum: RoomType })
  type: RoomType;

  @Column({ name: 'max_occupancy', type: 'int' })
  maxOccupancy: number;

  @Column({ name: 'size_sqft', type: 'decimal', precision: 8, scale: 2, nullable: true })
  sizeSqft: number;

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.AVAILABLE })
  status: RoomStatus;

  @Column({ type: 'text', array: true, default: '{}' })
  amenities: string[];

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

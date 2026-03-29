import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from '../../users/entities/user.entity';
import { Cruise } from '../../cruises/entities/cruise.entity';
import { Room } from '../../rooms/entities/room.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum BookingItemType {
  RESTAURANT = 'restaurant_slot',
  SHOW = 'show',
  CASINO = 'casino_event',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_reference', unique: true, length: 12 })
  bookingReference: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Cruise, { nullable: false, eager: true })
  @JoinColumn({ name: 'cruise_id' })
  cruise: Cruise;

  @ManyToOne(() => Room, { nullable: false, eager: true })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ name: 'guest_count', type: 'int', default: 1 })
  guestCount: number;

  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests: string;

  @OneToMany(() => BookingItem, (item) => item.booking, {
    cascade: true,
    eager: true,
  })
  items: BookingItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('booking_items')
export class BookingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @ManyToOne(() => Booking, (b) => b.items, { nullable: false })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'enum', enum: BookingItemType })
  itemType: BookingItemType;

  /** UUID of the related entity (restaurant_slot / show / casino_event) */
  @Column({ name: 'item_id' })
  itemId: string;

  /** Denormalised display name */
  @Column({ name: 'item_name', length: 255 })
  itemName: string;

  @Column({ name: 'activity_date', type: 'date' })
  activityDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
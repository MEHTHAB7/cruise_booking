import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Ship } from '../../ships/entities/ship.entity';
import { Cruise } from '../../cruises/entities/cruise.entity';

export enum CasinoGameType {
  POKER = 'poker',
  BLACKJACK = 'blackjack',
  ROULETTE = 'roulette',
  SLOTS_TOURNAMENT = 'slots_tournament',
  BACCARAT = 'baccarat',
  LESSON = 'beginner_lesson',
}

@Entity('casino_events')
export class CasinoEvent {
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

  @Column({ type: 'enum', enum: CasinoGameType })
  gameType: CasinoGameType;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'booked_count', type: 'int', default: 0 })
  bookedCount: number;

  @Column({ name: 'min_age', type: 'int', default: 18, comment: 'Casino events require 18+' })
  minAge: number;

  @Column({ name: 'skill_level', length: 50, nullable: true, comment: 'beginner, intermediate, advanced' })
  skillLevel: string;

  @Column({ name: 'buy_in_usd', type: 'decimal', precision: 8, scale: 2, nullable: true })
  buyInUsd: number;

  @Column({ length: 300, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

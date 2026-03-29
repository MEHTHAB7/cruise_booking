import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cruise } from '../../cruises/entities/cruise.entity';

@Entity('ports')
export class Port {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  country: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Cruise, (cruise) => cruise.departurePort)
  departures: Cruise[];

  @OneToMany(() => Cruise, (cruise) => cruise.destinationPort)
  arrivals: Cruise[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
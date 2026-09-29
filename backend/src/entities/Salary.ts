import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Employee } from './Employee';

@Entity('salaries')
export class Salary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  employee_id!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @Column({ type: 'date' })
  effective_from!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;
}

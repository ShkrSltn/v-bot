import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AdminRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  EDITOR = 'editor'
}

@Entity('admin_profiles')
export class AdminProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.EDITOR
  })
  role: AdminRole;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bot_history')
export class BotHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @CreateDateColumn()
  date: Date;

  @Column({ default: false })
  status: boolean; // false - пользователь не получил ответ, true - получил

  @Column({ type: 'float', array: true, nullable: true })
  embedding: number[];

  @Column({ default: false })
  hasEmbedding: boolean;
} 
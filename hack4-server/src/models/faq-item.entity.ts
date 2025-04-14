import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { Document } from './document.entity';

@Entity('faq_items')
export class FaqItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @ManyToOne(() => Subcategory, subcategory => subcategory.faqItems, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @Column()
  subcategory_id: number;

  @OneToMany(() => Document, document => document.faqItem, {
    cascade: true
  })
  documents: Document[];

  @Column({ type: 'simple-array', nullable: true })
  embedding: number[];

  @Column({ default: false })
  hasEmbedding: boolean;
} 
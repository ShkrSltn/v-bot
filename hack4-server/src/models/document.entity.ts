import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FaqItem } from './faq-item.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  url: string;

  @ManyToOne(() => FaqItem, faqItem => faqItem.documents, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'faq_item_id' })
  faqItem: FaqItem;

  @Column()
  faq_item_id: number;
} 
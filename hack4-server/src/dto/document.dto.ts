export class CreateDocumentDto {
  url: string;
  faq_item_id: number;
}

export class UpdateDocumentDto {
  url?: string;
  faq_item_id?: number;
} 
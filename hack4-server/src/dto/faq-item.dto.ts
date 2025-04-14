export class CreateFaqItemDto {
  question: string;
  answer: string;
  subcategory_id: number;
}

export class UpdateFaqItemDto {
  question?: string;
  answer?: string;
  subcategory_id?: number;
} 
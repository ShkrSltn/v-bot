export class CreateBotHistoryDto {
  question: string;
  answer: string;
  status?: boolean;
}

export class UpdateBotHistoryDto {
  question?: string;
  answer?: string;
  status?: boolean;
  embedding?: number[];
  hasEmbedding?: boolean;
} 
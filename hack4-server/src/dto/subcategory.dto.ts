export class CreateSubcategoryDto {
  name: string;
  category_id: number;
}

export class UpdateSubcategoryDto {
  name?: string;
  category_id?: number;
} 
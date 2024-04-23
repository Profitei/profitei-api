export class SummaryResponseDto {
  id: number;
  name: string;
  image: string;
  price: number;
  categoryName: string;
  isFeatured: boolean;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image;
    this.price = data.price;
    this.categoryName = data.category.name;
    this.isFeatured = data.isFeatured;
  }
}

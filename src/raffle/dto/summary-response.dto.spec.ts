import { SummaryResponseDto } from './summary-response.dto';

describe('SummaryResponseDto', () => {
  let data: any;

  beforeEach(() => {
    data = {
      id: 1,
      name: 'Product 1',
      image: 'product1.jpg',
      price: 10,
      category: {
        name: 'Category 1',
      },
      isFeatured: true,
      steamPrice: 500,
    };
  });

  it('should create an instance of SummaryResponseDto', () => {
    const dto = new SummaryResponseDto(data);
    expect(dto).toBeInstanceOf(SummaryResponseDto);
  });

  it('should set the id property correctly', () => {
    const dto = new SummaryResponseDto(data);
    expect(dto.id).toEqual(data.id);
  });

  it('should set the name property correctly', () => {
    const dto = new SummaryResponseDto(data);
    expect(dto.name).toEqual(data.name);
  });

  it('should set the image property correctly', () => {
    const dto = new SummaryResponseDto(data);
    expect(dto.image).toEqual(data.image);
  });

  it('should set the price property correctly', () => {
    const dto = new SummaryResponseDto(data);
    expect(dto.price).toEqual(data.price);
  });

  it('should set the categoryName property correctly', () => {
    const dto = new SummaryResponseDto(data);
    expect(dto.categoryName).toEqual(data.category.name);
  });

  it('should set the isFeatured property correctly', () => {
    const dto = new SummaryResponseDto(data);
    expect(dto.isFeatured).toEqual(data.isFeatured);
  });

  it('should set the steamPrice property correctly', () => {
    const dto = new SummaryResponseDto(data);
    expect(dto.steamPrice).toEqual(data.steamPrice);
  });
});

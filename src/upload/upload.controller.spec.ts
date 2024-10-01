import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        UploadService,
        ConfigService,
        {
          provide: UploadService,
          useValue: {
            uploadToOCI: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should return an image URL when upload is successful', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('mock buffer'),
        size: 1024,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const mockUrl = 'https://oci.example.com/uploaded-image-url';
      jest.spyOn(uploadService, 'uploadToOCI').mockResolvedValue(mockUrl);

      const result = await controller.uploadImage(mockFile);
      expect(result).toEqual({ url: mockUrl });
      expect(uploadService.uploadToOCI).toHaveBeenCalledWith(mockFile);
    });
  });
});

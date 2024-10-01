import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { OciObjectStorageService } from '../oci/oci-object-storage.service';

describe('UploadService', () => {
  let service: UploadService;
  let ociObjectStorageService: OciObjectStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: OciObjectStorageService,
          useValue: {
            putObject: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    ociObjectStorageService = module.get<OciObjectStorageService>(OciObjectStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadToOCI', () => {
    it('should return a URL when upload is successful', async () => {
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
      jest.spyOn(ociObjectStorageService, 'putObject').mockResolvedValue(mockUrl);

      const result = await service.uploadToOCI(mockFile);
      expect(result).toEqual(mockUrl);
      expect(ociObjectStorageService.putObject).toHaveBeenCalledWith(mockFile);
    });

    it('should throw an error when upload fails', async () => {
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

      jest.spyOn(ociObjectStorageService, 'putObject').mockRejectedValue(new Error('Upload failed'));

      await expect(service.uploadToOCI(mockFile)).rejects.toThrow('Upload failed');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { OciObjectStorageService } from './oci-object-storage.service';
import { ConfigService } from '@nestjs/config';

jest.mock('oci-objectstorage', () => {
  return {
    ObjectStorageClient: jest.fn().mockImplementation(() => ({
      putObject: jest.fn().mockResolvedValue({
        opcRequestId: 'mock_request_id',
        eTag: 'mock_etag',
        lastModified: new Date(),
      }),
    })),
  };
});

jest.mock('oci-common', () => ({
  ConfigFileAuthenticationDetailsProvider: jest.fn().mockImplementation(() => ({})),
}));

describe('OciObjectStorageService', () => {
  let service: OciObjectStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OciObjectStorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'OCI_CONFIG_FILE_PATH':
                  return '/mock/path/to/config';
                case 'OCI_CONFIG_PROFILE':
                  return 'DEFAULT';
                case 'OCI_NAMESPACE':
                  return 'mock_namespace';
                case 'OCI_BUCKET_NAME':
                  return 'mock_bucket';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OciObjectStorageService>(OciObjectStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

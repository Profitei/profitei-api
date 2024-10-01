import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectStorageClient } from 'oci-objectstorage';
import { ConfigFileAuthenticationDetailsProvider } from 'oci-common';
import { PutObjectRequest } from 'oci-objectstorage/lib/request';

@Injectable()
export class OciObjectStorageService {
  private readonly objectStorageClient: ObjectStorageClient;
  private readonly logger = new Logger(OciObjectStorageService.name);
  private readonly namespace: string;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {

    const configFilePath = this.configService.get<string>('OCI_CONFIG_FILE_PATH');
    const profile = this.configService.get<string>('OCI_CONFIG_PROFILE');

    const provider = new ConfigFileAuthenticationDetailsProvider(configFilePath, profile);

    this.objectStorageClient = new ObjectStorageClient({ authenticationDetailsProvider: provider });
    this.namespace = this.configService.get<string>('OCI_NAMESPACE');
    this.bucketName = this.configService.get<string>('OCI_BUCKET_NAME');
  }

  async putObject(file: Express.Multer.File): Promise<string> {
    const putObjectRequest: PutObjectRequest = {
      namespaceName: this.namespace,
      bucketName: this.bucketName,
      objectName: file.originalname,
      putObjectBody: file.buffer,
      contentType: file.mimetype,
    };

    try {
      await this.objectStorageClient.putObject(putObjectRequest);
      this.logger.log(`File uploaded successfully: ${file.originalname}`);
      return `https://objectstorage.sa-vinhedo-1.oraclecloud.com/n/${this.namespace}/b/${this.bucketName}/o/${file.originalname}`;
    } catch (error) {
      this.logger.error('Error uploading file to OCI', error);
      throw error;
    }
  }
}

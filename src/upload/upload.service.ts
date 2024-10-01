import { Injectable } from '@nestjs/common';
import { OciObjectStorageService } from '../oci/oci-object-storage.service';

@Injectable()
export class UploadService {
  constructor(private readonly ociObjectStorageService: OciObjectStorageService) {}

  async uploadToOCI(file: Express.Multer.File): Promise<string> {
    return await this.ociObjectStorageService.putObject(file);
  }
}

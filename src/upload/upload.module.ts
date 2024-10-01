import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { OciObjectStorageModule } from '../oci/oci-object-storage.module';

@Module({
  imports: [OciObjectStorageModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

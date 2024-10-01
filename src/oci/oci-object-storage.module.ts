import { Module } from '@nestjs/common';
import { OciObjectStorageService } from './oci-object-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [OciObjectStorageService],
  exports: [OciObjectStorageService],
})
export class OciObjectStorageModule {}

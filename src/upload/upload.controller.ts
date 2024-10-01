import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';

@ApiTags('upload')
@ApiSecurity('x-api-key')
@Public()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiConsumes('multipart/form-data')
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 5000 * 1024 }), 
            new FileTypeValidator({ fileType: /^(image\/jpeg|image\/png|image\/bmp|image\/webp)$/ }),  
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const imageUrl = await this.uploadService.uploadToOCI(file);
    return { url: imageUrl };
  }
}

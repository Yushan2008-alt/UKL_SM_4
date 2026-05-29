import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { UploadService } from './upload.service'

const IMAGE_LIMIT = Number(process.env.MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024
const FILE_LIMIT = Number(process.env.MAX_FILE_SIZE_MB ?? 10) * 1024 * 1024

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: IMAGE_LIMIT },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Hanya file jpg, png, webp yang diizinkan'), false)
      }
      cb(null, true)
    },
  }))
  @ApiConsumes('multipart/form-data')
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File tidak ditemukan')
    const url = await this.uploadService.uploadImage(file.buffer, file.originalname)
    return { url }
  }

  @Post('file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: FILE_LIMIT },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(pdf|zip)$/) && !file.originalname.match(/\.(pdf|zip)$/i)) {
        return cb(new BadRequestException('Hanya file PDF dan ZIP yang diizinkan'), false)
      }
      cb(null, true)
    },
  }))
  @ApiConsumes('multipart/form-data')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File tidak ditemukan')
    const url = await this.uploadService.uploadFile(file.buffer, file.originalname)
    return { url }
  }
}

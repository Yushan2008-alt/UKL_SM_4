import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    })
  }

  async uploadImage(buffer: Buffer, originalName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'student-commerce',
          public_id: `${Date.now()}-${originalName.replace(/\.[^.]+$/, '')}`,
          resource_type: 'image',
          format: 'webp',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result!.secure_url)
        },
      )
      Readable.from(buffer).pipe(uploadStream)
    })
  }
}

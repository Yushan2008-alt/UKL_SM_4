import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class BecomeSellerInput {
  @ApiProperty({ example: 'Toko Buku Bilal', description: 'Nama toko (min 3, max 100 karakter)' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  shopName: string

  @ApiProperty({ example: 'Menjual buku bekas dan alat tulis murah', description: 'Deskripsi toko (min 10, max 500 karakter)' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  shopDescription: string

  @ApiPropertyOptional({ example: 'Buku & Alat Tulis', description: 'Kategori toko' })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'URL logo toko' })
  @IsOptional()
  @IsString()
  shopLogo?: string
}

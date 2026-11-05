import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ClientRejectDto {
  @ApiProperty({
    example: 'Budget exceeded our current Q4 allocation',
    description: 'Client feedback reason for declining the quotation',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

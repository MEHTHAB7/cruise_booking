import { IsUUID, IsInt, Min, Max, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  cruiseId: string;

  @ApiProperty()
  @IsUUID()
  roomId: string;

  @ApiProperty({ minimum: 1, maximum: 8 })
  @IsInt()
  @Min(1)
  @Max(8)
  guestCount: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialRequests?: string;
}

import { IsUUID, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddActivityDto {
  @ApiProperty({ enum: ['restaurant_slot', 'show', 'casino_event'] })
  @IsIn(['restaurant_slot', 'show', 'casino_event'])
  type: 'restaurant_slot' | 'show' | 'casino_event';

  @ApiProperty()
  @IsUUID()
  itemId: string;
}

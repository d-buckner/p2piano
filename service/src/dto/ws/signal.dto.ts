import { IsString, IsUUID, IsIn, ValidateNested, IsObject, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class SignalDataDto {
  @IsString()
  @MaxLength(10000) // Reasonable limit for SDP
  sdp: string;

  @IsString()
  @IsIn(['offer', 'answer', 'pranswer', 'rollback'])
  type: string;
}

export class SignalPayloadDto {
  @IsUUID(4)
  userId: string;

  @ValidateNested()
  @Type(() => SignalDataDto)
  @IsObject()
  signalData: SignalDataDto;
}
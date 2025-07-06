import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested, IsObject, MaxLength, IsOptional, IsIn } from 'class-validator';


class SignalDataDto {
  @IsString()
  @MaxLength(10000) // Consistent with test expectations
  @IsOptional()
  sdp?: string;

  @IsString()
  @IsIn(['offer', 'answer', 'pranswer', 'rollback'])
  @IsOptional()
  type?: string;

  // ICE candidate fields
  @IsOptional()
  candidate?: string;

  @IsOptional()
  sdpMLineIndex?: number;

  @IsOptional()
  sdpMid?: string;
}

export class SignalPayloadDto {
  @IsUUID(4)
  userId: string;

  @ValidateNested()
  @Type(() => SignalDataDto)
  @IsObject()
  signalData: SignalDataDto;
}

import { IsString, IsUUID, ValidateNested, IsObject, MaxLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class SignalDataDto {
  @IsString()
  @MaxLength(50000) // Increased limit for SimplePeer SDP
  @IsOptional()
  sdp?: string;

  @IsString()
  @IsOptional()
  type?: string;

  // ICE candidate fields
  @IsOptional()
  candidate?: any;

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
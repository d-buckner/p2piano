import { IsArray, IsUUID, ArrayMaxSize } from 'class-validator';

export class CrdtMessageDto {
  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMaxSize(50) // Reasonable limit for target users
  targetUserIds!: string[];

  // Allow additional properties for CRDT message data
  [key: string]: any;
}
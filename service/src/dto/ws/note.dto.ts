import { IsNumber, IsArray, IsUUID, Min, Max, ArrayMaxSize } from 'class-validator';

export class NoteOnDto {
  @IsNumber()
  @Min(0)
  @Max(127) // MIDI note range
  note: number;

  @IsNumber()
  @Min(0)
  @Max(127) // MIDI velocity range
  velocity: number;

  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMaxSize(50) // Reasonable limit for target users
  targetUserIds: string[];
}

export class NoteOffDto {
  @IsNumber()
  @Min(0)
  @Max(127) // MIDI note range
  note: number;

  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMaxSize(50) // Reasonable limit for target users
  targetUserIds: string[];
}
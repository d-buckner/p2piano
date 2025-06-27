import { IsString, Length, Matches } from 'class-validator';

export class RoomParamDto {
  @IsString()
  @Length(5, 5)
  @Matches(/^[abcdefghjkmnpqrstuvwxyz23456789]{5}$/, { message: 'Room ID must be 5 lowercase characters from allowed alphabet' })
  id: string;
}
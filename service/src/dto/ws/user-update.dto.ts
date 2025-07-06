import { IsString, IsIn, IsUUID, MaxLength, MinLength, Matches } from 'class-validator';


export class UserUpdateDto {
  @IsUUID(4)
  userId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  displayName!: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/, { 
    message: 'Color must be a valid hex color code (e.g., #fff or #ffffff)' 
  })
  color!: string;

  @IsString()
  @IsIn(['PIANO', 'SYNTH', 'ELECTRIC_BASS'])
  instrument!: string;
}

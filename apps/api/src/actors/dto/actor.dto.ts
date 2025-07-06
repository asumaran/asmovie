import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateActorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  biography?: string;
}

export class UpdateActorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  biography?: string;
}

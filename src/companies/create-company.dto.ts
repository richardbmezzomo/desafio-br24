import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

class CreateContactDto {
  @IsString()
  name: string;

  @IsString()
  lastName: string;
}

export class CreateCompanyDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts: CreateContactDto[];
}

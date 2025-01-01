import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './company.entity';
import { CreateCompanyDto } from './create-company.dto';
import { UpdateCompanyDto } from './update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.companiesService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreateCompanyDto) {
    return this.companiesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateCompanyDto) {
    return this.companiesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    return this.companiesService.remove(id);
  }
}

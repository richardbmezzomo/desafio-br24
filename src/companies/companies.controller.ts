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
import axios from 'axios';
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
    let bitrixId: number;

    try {
      const webhookUrl =
        'https://b24-kjr9os.bitrix24.com.br/rest/1/kj0k18cljjedxcfg/crm.company.add.json';
      const response = await axios.post(webhookUrl, {
        fields: {
          TITLE: data.title,
        },
      });

      bitrixId = (response.data as { result: number }).result;
      console.log('Empresa criada no Bitrix com sucesso, ID:', bitrixId);
    } catch (error) {
      console.error(
        'Erro ao criar empresa no Bitrix:',
        error.response?.data || error.message,
      );
      throw new Error('Erro ao criar empresa no Bitrix');
    }

    const company = await this.companiesService.createWithId(bitrixId, data);

    return company;
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

  @Delete('contact/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeContact(@Param('id') id: number): Promise<void> {
    return this.companiesService.removeContact(id);
  }
}

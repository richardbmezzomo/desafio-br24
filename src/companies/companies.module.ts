import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Contact } from 'src/contacts/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Contact])],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [TypeOrmModule],
})
export class CompaniesModule {}

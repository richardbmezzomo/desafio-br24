import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './contact.entity';
import { Repository } from 'typeorm';
import { Company } from 'src/companies/company.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(
    contactData: Partial<Contact>,
    companyId: number,
  ): Promise<Contact> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error('Company not found');
    }

    const contact = this.contactRepository.create({
      ...contactData,
      company,
    });
    return this.contactRepository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.find({ relations: ['company'] });
  }

  async findOne(id: number): Promise<Contact> {
    return this.contactRepository.findOne({
      where: { id },
      relations: ['company'],
    });
  }

  async update(id: number, contactData: Partial<Contact>): Promise<Contact> {
    await this.contactRepository.update(id, contactData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.contactRepository.delete(id);
  }
}

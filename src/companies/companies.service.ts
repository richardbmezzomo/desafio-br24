import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './create-company.dto';
import { Contact } from 'src/contacts/contact.entity';
import { UpdateCompanyDto } from './update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Contact) // Injetar o repositório de Contact
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(data: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create({ title: data.title });
    const savedCompany = await this.companyRepository.save(company);

    if (data.contacts && data.contacts.length > 0) {
      const contacts = data.contacts.map((contact) =>
        this.contactRepository.create({ ...contact, company: savedCompany }),
      );

      await this.contactRepository.save(contacts);
    }
    return this.companyRepository.findOne({
      where: { id: savedCompany.id },
      relations: ['contacts'],
    });
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({ relations: ['contacts'] });
  }

  async findOne(id: number): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });
  }

  async update(id: number, data: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });

    if (!company) {
      throw new Error(`Empresa não encontrada!`);
    }

    // Atualiza o título da empresa
    if (data.title) {
      company.title = data.title;
    }

    if (data.contacts) {
      const updatedContacts = [];

      for (const contact of data.contacts) {
        if (contact.id) {
          const existingContact = await this.contactRepository.findOne({
            where: { id: contact.id, company: { id } },
          });

          if (existingContact) {
            Object.assign(existingContact, contact);
            updatedContacts.push(existingContact);
          }
        } else {
          const newContact = this.contactRepository.create({
            ...contact,
            company,
          });
          updatedContacts.push(newContact);
        }
      }

      await this.contactRepository.save(updatedContacts);

      company.contacts = updatedContacts;
    }

    await this.companyRepository.save(company);

    return this.companyRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });
  }

  async remove(id: number): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });

    if (!company) {
      throw new Error(`Empresa não encontrada!`);
    }

    await this.companyRepository.remove(company);
  }
}

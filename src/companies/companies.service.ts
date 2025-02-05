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

    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(data: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create({
      title: data.title,
    });

    const savedCompany = await this.companyRepository.save(company);

    if (data.contacts && data.contacts.length > 0) {
      const validContacts = data.contacts.filter(
        (contact) => contact.name && contact.lastName,
      );

      const contacts = validContacts.map((contact) =>
        this.contactRepository.create({
          name: contact.name,
          lastName: contact.lastName,
          company: savedCompany,
        }),
      );

      await this.contactRepository.save(contacts);
    }

    return this.companyRepository.findOne({
      where: { id: savedCompany.id },
      relations: ['contacts'],
    });
  }

  async findAll(): Promise<Company[]> {
    const localCompanies = await this.companyRepository.find({
      relations: ['contacts'],
    });

    return [...localCompanies];
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
      throw new Error('Empresa não encontrada!');
    }

    if (data.title) {
      company.title = data.title;
    }

    const existingContactsMap = new Map(
      company.contacts.map((contact) => [contact.id, contact]),
    );

    const updatedContacts = [];

    for (const contact of data.contacts) {
      if (contact.id && existingContactsMap.has(contact.id)) {
        const existingContact = existingContactsMap.get(contact.id);
        Object.assign(existingContact, {
          name: contact.name,
          lastName: contact.lastName,
        });
        updatedContacts.push(existingContact);
      } else if (!contact.id) {
        const newContact = this.contactRepository.create({
          name: contact.name,
          lastName: contact.lastName,
          company,
        });
        updatedContacts.push(newContact);
      }
    }

    await this.contactRepository.save(updatedContacts);

    const allContacts = [...company.contacts, ...updatedContacts].filter(
      (contact, index, self) =>
        index === self.findIndex((c) => c.id === contact.id),
    );

    company.contacts = allContacts;

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

  async removeContact(id: number): Promise<void> {
    const contact = await this.contactRepository.findOne({
      where: { id },
    });

    if (!contact) {
      throw new Error(`Contato com ID ${id} não encontrado!`);
    }

    await this.contactRepository.remove(contact);
  }
}

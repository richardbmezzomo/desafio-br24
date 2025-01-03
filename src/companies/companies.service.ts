import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './create-company.dto';
import { Contact } from 'src/contacts/contact.entity';
import { UpdateCompanyDto } from './update-company.dto';
import axios from 'axios';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async createWithId(id: number, data: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create({
      id,
      title: data.title,
    });

    const savedCompany = await this.companyRepository.save(company);

    if (data.contacts && data.contacts.length > 0) {
      const validContacts = data.contacts.filter(
        (contact) => contact.name && contact.lastName,
      );

      const contacts = [];
      for (const contact of validContacts) {
        try {
          const contactUrl =
            'https://b24-kjr9os.bitrix24.com.br/rest/1/kj0k18cljjedxcfg/crm.contact.add.json';
          const response = await axios.post(contactUrl, {
            fields: {
              NAME: contact.name,
              LAST_NAME: contact.lastName,
              COMPANY_ID: id,
            },
          });

          const bitrixContactId = (response.data as { result: number }).result;

          const newContact = this.contactRepository.create({
            id: bitrixContactId,
            name: contact.name,
            lastName: contact.lastName,
            company: savedCompany,
          });

          contacts.push(newContact);
        } catch (error) {
          console.error(
            `Erro ao criar contato no Bitrix (${contact.name}):`,
            error.response?.data || error.message,
          );
        }
      }

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
      throw new Error('Empresa não encontrada!');
    }

    if (data.title) {
      company.title = data.title;
    }

    const updatedContacts = [];
    for (const contact of data.contacts) {
      if (contact.id) {
        const existingContact = await this.contactRepository.findOne({
          where: { id: contact.id, company: { id } },
        });

        if (existingContact) {
          Object.assign(existingContact, contact);
          updatedContacts.push(existingContact);

          try {
            const contactUpdateUrl = `https://b24-kjr9os.bitrix24.com.br/rest/1/kj0k18cljjedxcfg/crm.contact.update.json`;
            await axios.post(contactUpdateUrl, {
              id: contact.id,
              fields: {
                NAME: contact.name,
                LAST_NAME: contact.lastName,
              },
            });
            console.log(`Contato ${contact.id} atualizado no Bitrix.`);
          } catch (error) {
            console.error(
              `Erro ao atualizar contato ${contact.id} no Bitrix:`,
              error.response?.data || error.message,
            );
          }
        }
      } else {
        try {
          const contactCreateUrl = `https://b24-kjr9os.bitrix24.com.br/rest/1/kj0k18cljjedxcfg/crm.contact.add.json`;
          const response = await axios.post(contactCreateUrl, {
            fields: {
              NAME: contact.name,
              LAST_NAME: contact.lastName,
              COMPANY_ID: id,
            },
          });

          const bitrixContactId = (response.data as { result: number }).result;

          const newContact = this.contactRepository.create({
            id: bitrixContactId,
            name: contact.name,
            lastName: contact.lastName,
            company,
          });

          updatedContacts.push(newContact);
        } catch (error) {
          console.error(
            `Erro ao criar contato no Bitrix (${contact.name}):`,
            error.response?.data || error.message,
          );
        }
      }
    }

    await this.contactRepository.save(updatedContacts);
    company.contacts = updatedContacts;

    await this.companyRepository.save(company);

    // Atualiza empresa no Bitrix
    try {
      const companyUpdateUrl = `https://b24-kjr9os.bitrix24.com.br/rest/1/kj0k18cljjedxcfg/crm.company.update.json`;
      await axios.post(companyUpdateUrl, {
        id,
        fields: { TITLE: company.title },
      });
      console.log(`Empresa ${id} atualizada no Bitrix com sucesso.`);
    } catch (error) {
      console.error(
        `Erro ao atualizar empresa ${id} no Bitrix:`,
        error.response?.data || error.message,
      );
    }

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

    for (const contact of company.contacts) {
      try {
        const contactDeleteUrl = `https://b24-kjr9os.bitrix24.com.br/rest/1/kj0k18cljjedxcfg/crm.contact.delete.json`;
        await axios.post(contactDeleteUrl, { id: contact.id });
        console.log(`Contato ${contact.id} removido do Bitrix com sucesso.`);
      } catch (error) {
        console.error(
          `Erro ao remover contato ${contact.id} do Bitrix:`,
          error.response?.data || error.message,
        );
      }
    }

    try {
      const companyDeleteUrl = `https://b24-kjr9os.bitrix24.com.br/rest/1/kj0k18cljjedxcfg/crm.company.delete.json`;
      await axios.post(companyDeleteUrl, { id });
      console.log(`Empresa ${id} removida do Bitrix com sucesso.`);
    } catch (error) {
      console.error(
        `Erro ao remover empresa ${id} do Bitrix:`,
        error.response?.data || error.message,
      );
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

    try {
      const contactDeleteUrl = `https://b24-kjr9os.bitrix24.com.br/rest/1/kj0k18cljjedxcfg/crm.contact.delete.json`;
      await axios.post(contactDeleteUrl, { id });
      console.log(`Contato ${id} removido do Bitrix com sucesso.`);
    } catch (error) {
      console.error(
        `Erro ao remover contato ${id} do Bitrix:`,
        error.response?.data || error.message,
      );
    }
  }
}

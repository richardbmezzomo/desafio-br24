import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Contact } from 'src/contacts/contact.entity';

@Entity('companies')
export class Company {
  @PrimaryColumn()
  id: number;
  @Column()
  title: string;

  @OneToMany(() => Contact, (contact) => contact.company)
  contacts: Contact[];
}

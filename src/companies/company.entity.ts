import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Contact } from 'src/contacts/contact.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;

  @OneToMany(() => Contact, (contact) => contact.company)
  contacts: Contact[];
}

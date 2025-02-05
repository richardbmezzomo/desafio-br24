import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contact } from 'src/contacts/contact.entity';

@Entity('companies')
export class Company {
  @PrimaryColumn()
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;

  @OneToMany(() => Contact, (contact) => contact.company)
  contacts: Contact[];
}

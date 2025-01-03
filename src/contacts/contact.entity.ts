import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity('contacts')
export class Contact {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @ManyToOne(() => Company, (company) => company.contacts, {
    onDelete: 'CASCADE',
  })
  company: Company;
}

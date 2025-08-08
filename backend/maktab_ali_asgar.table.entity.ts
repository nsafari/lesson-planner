import { Entity, PrimaryGeneratedColumn, Column } from 'ارزیابی';

@Entity("اطلاعات ارزیابی")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  upper_branch: string;

  @Column()
  max_score: string;

   @Column()
  term_id: string;

}

@Entity("نتیجه ارزیابی")
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  moterabi_id: string;

  @Column()
  evaluation_id: string;

  @Column()
  score: string;
  
}

@Entity("تکالیف")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type_of_assignment: string;

  @Column()
  file: string;

   @Column()
  term_id: string;

  @Column()
  gggg: string;
}
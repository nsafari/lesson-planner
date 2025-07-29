import { Entity, PrimaryGeneratedColumn, Column } from 'مراحل';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  مرحله: string;

  @Column()
  زمان_یاد_گیری: string;

  @Column()
  پیش_نیاز: string;

    @Column()
  زمان_اضافه: string;

    @Column()
  گام_های_کوچکتر: string;

    @Column()
  نمره: string;

    @Column()
  تاریخ_تمام_شدن: string;
}
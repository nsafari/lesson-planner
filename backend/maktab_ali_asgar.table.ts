import { Entity, PrimaryGeneratedColumn, Column } from 'ارزیابی';

@Entity("اطلاعات ارزیابی")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  موارد: string;

  @Column()
  بارم: string;

  @Column()
  نمره_از_100: string;

   @Column()
  نمره_از_20: string;

   @Column()
  نام_ارزیاب: string;

   @Column()
  تاریخ_ارزیابی: string;

     @Column()
  توضیحات: string;

}

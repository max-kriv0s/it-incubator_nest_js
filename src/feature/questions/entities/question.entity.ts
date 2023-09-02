import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Question' })
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @Column('json')
  correctAnswers: string[];

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ type: Date, nullable: true })
  updatedAt: Date | null;
}

import { User } from '../../../feature/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'SecurityDevices' })
export class SecurityDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  lastActiveDate: Date;

  @Column({ nullable: true })
  expirationTime: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.securityDevices, {
    onDelete: 'CASCADE',
  })
  user: User;
}

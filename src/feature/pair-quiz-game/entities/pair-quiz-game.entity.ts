import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PairQuizGameProgress } from './pair-quiz-game-progress.entity';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity({ name: 'PairQuizGame' })
export class PairQuizGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstPlayerId: number;

  @ManyToOne(() => User)
  firstPlayer: User;

  @Column({ type: Number, nullable: true })
  secondPlayerId: number | null;

  @ManyToOne(() => User)
  secondPlayer: User;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.PendingSecondPlayer,
  })
  status: GameStatus;

  @CreateDateColumn()
  pairCreateDate: Date;

  @Column({ type: Date, nullable: true })
  startGame: Date | null;

  @Column({ type: Date, nullable: true })
  finishGame: Date | null;

  @OneToMany(() => PairQuizGameProgress, (gameProgree) => gameProgree.game)
  gameProgress: PairQuizGameProgress[];
}

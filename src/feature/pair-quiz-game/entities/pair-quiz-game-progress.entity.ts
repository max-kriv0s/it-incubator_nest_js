import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';
import { User } from '../../users/entities/user.entity';
import { PairQuizGame } from './pair-quiz-game.entity';

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

@Entity({ name: 'PairQuizGameProgress' })
@Index(['game', 'user', 'question'], { unique: true })
export class PairQuizGameProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @ManyToOne(() => PairQuizGame, (game) => game.gameProgress)
  game: PairQuizGame;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  questionId: number;

  @ManyToOne(() => Question)
  question: Question;

  @Column()
  questionNumber: number;

  @Column({ type: Date, nullable: true })
  addedAt: Date | null;

  @Column({
    type: 'enum',
    enum: AnswerStatus,
    nullable: true,
  })
  answerStatus: AnswerStatus;

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  bonus_score: number;

  addAnswer(answer: string) {
    if (this.question.correctAnswers.includes(answer)) {
      this.answerStatus = AnswerStatus.Correct;
      this.score += 1;
    } else {
      this.answerStatus = AnswerStatus.Incorrect;
    }
    this.addedAt = new Date();
  }
}

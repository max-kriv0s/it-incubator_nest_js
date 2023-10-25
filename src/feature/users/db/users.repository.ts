import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async deleteUserById(id: number): Promise<DeleteResult> {
    return this.usersRepository.delete({ id });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { telegramAccount: true },
    });
  }

  async save(user: User) {
    await this.usersRepository.save(user);
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      passwordRecoveryCode: recoveryCode,
    });
  }

  async findUserByCodeConfirmation(code: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ confirmationCode: code });
  }
}

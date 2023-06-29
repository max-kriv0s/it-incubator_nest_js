import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import { UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(userDto: CreateUserDto): Promise<string> {
    const hashPassword = await this._generatePasswordHash(userDto.password);

    const newUser = this.usersRepository.createUser({
      ...userDto,
      password: hashPassword,
    });
    const createdUser = await this.usersRepository.save(newUser);
    return createdUser._id.toString();
  }

  async _generatePasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async deleteUserById(id: string) {
    return this.usersRepository.deleteUserById(id);
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return null;

    if (!user.emailConfirmation.isConfirmed) return null;

    const validPassword = await bcrypt.compare(
      password,
      user.accountData.password,
    );
    if (!validPassword) return null;

    return user._id.toString();
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.findUserById(userId);
  }
}

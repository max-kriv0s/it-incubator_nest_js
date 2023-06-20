import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt, { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(userDto: CreateUserDto): Promise<UserDocument> {
    const hashPassword = await this._generatePasswordHash(userDto.password);

    const newUser = await this.usersRepository.createUser({
      ...userDto,
      password: hashPassword,
    });
    const createdUser = await this.usersRepository.save(newUser);
    return createdUser;
  }

  async _generatePasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async deleteUserById(id: string): Promise<UserDocument | null> {
    return this.usersRepository.deleteUserById(id);
  }
}

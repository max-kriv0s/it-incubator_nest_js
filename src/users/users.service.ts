import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';

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
    const deletedUser = await this.usersRepository.deleteUserById(id);
    if (!deletedUser) throw new NotFoundException('User not found');
  }
}

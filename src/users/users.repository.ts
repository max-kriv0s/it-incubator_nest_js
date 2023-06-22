import { Injectable } from '@nestjs/common';
import { validID } from '../utils';
import { User, UserDocument, UserModelType } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async createUser(userDto: CreateUserDto): Promise<UserDocument> {
    return this.UserModel.createUser(userDto, this.UserModel);
  }

  async deleteUserById(id: string): Promise<UserDocument | null> {
    if (!validID(id)) return null;
    return this.UserModel.findByIdAndDelete(id);
  }

  async deleteUsers() {
    await this.UserModel.deleteMany({});
  }
  async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }
}

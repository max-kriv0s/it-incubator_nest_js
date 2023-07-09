import { Injectable } from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  createUser(userDto: CreateUserDto): UserDocument {
    return this.UserModel.createUser(userDto, this.UserModel);
  }

  async deleteUserById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findByIdAndDelete(id);
  }

  async deleteUsers() {
    await this.UserModel.deleteMany({});
  }
  async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.UserModel.findById(userId);
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'passwordRecovery.recoveryCode': recoveryCode,
    });
  }

  async findUserByCodeConfirmation(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    }).exec();
  }
}

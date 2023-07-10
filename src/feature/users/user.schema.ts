import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { BanUnbanUserDto } from './dto/ban-unban-user.dto';

export type UserDocument = HydratedDocument<User>;

export type UserServiceDto = {
  accountData: AccountData;
  emailConfirmation: UserEmailConfirmation;
};

@Schema()
export class AccountData {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  createdAt: Date;
}

@Schema()
export class UserEmailConfirmation {
  @Prop()
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema()
export class UserPasswordRecovery {
  @Prop()
  recoveryCode: string;

  @Prop()
  expirationDate: Date;
}

@Schema()
export class BanInfo {
  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: new Date(0) })
  banDate: Date;

  @Prop({ default: '' })
  banReason: string;
}

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  accountData: AccountData;

  @Prop({ required: true })
  emailConfirmation: UserEmailConfirmation;

  @Prop()
  refreshToken: string;

  @Prop()
  passwordRecovery: UserPasswordRecovery;

  @Prop({ required: true })
  banInfo: BanInfo;

  static createUser(
    userDto: CreateUserDto,
    UserModel: UserModelType,
  ): UserDocument {
    const data = {
      accountData: {
        login: userDto.login,
        password: userDto.password,
        email: userDto.email,
        createdAt: new Date(),
      },
      emailConfirmation: {
        confirmationCode: '',
        expirationDate: new Date(),
        isConfirmed: true,
      },
      refreshToken: '',
      passwordRecovery: {
        recoveryCode: '',
        expirationDate: new Date(0),
      },
      banInfo: {},
    };

    const newUser = new UserModel(data);
    return newUser;
  }

  updatePasswordRecovery(passwordRecovery: UserPasswordRecovery) {
    this.passwordRecovery = passwordRecovery;
  }

  updateUserPassword(newPassworHash: string) {
    this.accountData.password = newPassworHash;
  }

  isConfirmed() {
    this.emailConfirmation.isConfirmed = true;
  }

  updateEmailConfirmation(emailConfimation: UserEmailConfirmation) {
    this.emailConfirmation = emailConfimation;
  }

  isBanned() {
    return this.banInfo.isBanned;
  }

  setBanUnbane(banDto: BanUnbanUserDto) {
    this.banInfo.isBanned = banDto.isBanned;
    if (banDto.isBanned) {
      this.banInfo.banReason = banDto.banReason;
      this.banInfo.banDate = new Date();
    } else {
      this.banInfo.banReason = '';
      this.banInfo.banDate = new Date(0);
    }
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  updatePasswordRecovery: User.prototype.updatePasswordRecovery,
  updateUserPassword: User.prototype.updateUserPassword,
  isConfirmed: User.prototype.isConfirmed,
  updateEmailConfirmation: User.prototype.updateEmailConfirmation,
  isBanned: User.prototype.isBanned,
  setBanUnbane: User.prototype.setBanUnbane,
};

export type UserModelStaticType = {
  createUser: (
    userDto: CreateUserDto,
    UserModel: UserModelType,
  ) => UserDocument;
};

const userStaticMethods: UserModelStaticType = {
  createUser: User.createUser,
};
UserSchema.statics = userStaticMethods;

export type UserModelType = Model<User> & UserModelStaticType;

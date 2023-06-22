import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class AccountData {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  createdAt: string;
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

  static createUser(
    userDto: CreateUserDto,
    UserModel: UserModelType,
  ): UserDocument {
    const data: Omit<User, '_id'> = {
      accountData: {
        login: userDto.login,
        password: userDto.password,
        email: userDto.email,
        createdAt: new Date().toISOString(),
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
    };

    const newUser = new UserModel(data);
    return newUser;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

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

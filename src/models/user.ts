import { Schema, Types, model } from 'mongoose';

export interface UserModel {
  email: string;
  password: string;
  username: string;
  fullName: string;
  phoneNumber: number;
  countryCode: string;
  profilePicture?: String;
  verified: boolean;
  followers: string[];
  following: string[];
}

const userSchema = new Schema<UserModel>(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    verified: {
      type: Boolean,
      required: true,
    },
    followers: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export const User = model<UserModel>('User', userSchema);

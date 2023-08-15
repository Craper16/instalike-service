import { Document, Types } from 'mongoose';
import { UserModel } from '../models/user';

export const returnUser = ({
  user,
}: {
  user:
    | (Document<unknown, {}, UserModel> &
        Omit<
          UserModel & {
            _id: Types.ObjectId;
          },
          never
        >)
    | undefined
    | null;
}) => {
  return {
    userId: user?._id,
    email: user?.email,
    username: user?.username,
    phoneNumber: user?.phoneNumber,
    countryCode: user?.countryCode,
    profilePicture: user?.profilePicture,
    fullName: user?.fullName,
    followers: user?.followers,
    following: user?.following,
  };
};

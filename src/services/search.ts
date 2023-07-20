import { ObjectId } from 'mongoose';
import { User } from '../models/user';

interface IUser {
  userId: ObjectId;
  username: string;
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: number;
  profilePicture: string;
  followers: string[];
  following: string[];
}

export async function userData(userId: string): Promise<IUser> {
  const user = await User.findById(userId);

  return {
    userId: user?._id! as any,
    countryCode: user?.countryCode!,
    email: user?.email!,
    fullName: user?.fullName!,
    phoneNumber: user?.phoneNumber!,
    profilePicture: user?.profilePicture! as any,
    username: user?.username!,
    followers: user?.followers!,
    following: user?.following!,
  };
}

export const searchUsers = async ({
  searchQuery,
  userId,
}: {
  searchQuery: string;
  userId: string;
}) => {
  const query = searchQuery.trim().replace('+', ' ');

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    }).limit(25);

    const usersToReturn = await Promise.all(
      users.map(async (user) => {
        return await userData(user._id.toString());
      })
    );

    if (!query) {
      return { users: [], status: 200 };
    }

    return {
      users: usersToReturn.filter(
        (user) => user.userId.toString() !== userId.toString()
      ),
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

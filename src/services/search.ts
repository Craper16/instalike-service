import { Types } from 'mongoose';
import { User } from '../models/user';
import { returnUser } from '../helpers/user';

export async function userData(userId: string): Promise<{
  userId: Types.ObjectId | undefined;
  email: string | undefined;
  username: string | undefined;
  phoneNumber: number | undefined;
  countryCode: string | undefined;
  profilePicture: String | undefined;
  fullName: string | undefined;
  followers: string[] | undefined;
  following: string[] | undefined;
}> {
  const user = await User.findById(userId);

  return returnUser({ user });
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
        (user) => user?.userId?.toString() !== userId.toString()
      ),
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

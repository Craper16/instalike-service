import { User } from '../models/user';

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

    const usersToReturn = users.map((user) => {
      return {
        userId: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
      };
    });
    if (!query) {
      return { users: [], status: 200 };
    }

    return { users: usersToReturn, status: 200 };
  } catch (error) {
    console.error(error);
  }
};

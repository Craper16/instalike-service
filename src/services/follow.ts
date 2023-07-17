import { User } from '../models/user';

export const followUser = async ({
  userId,
  userToFollowId,
}: {
  userId: string;
  userToFollowId: string;
}) => {
  try {
    const user = await User.findById(userId);
    const userToFollow = await User.findById(userToFollowId);

    if (!user) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    if (!userToFollow) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    user.following.push(userToFollow._id as any);
    userToFollow.followers.push(user._id as any);

    await userToFollow.save();

    const result = await user.save();

    return { user: result, status: 200 };
  } catch (error) {
    console.error(error);
  }
};

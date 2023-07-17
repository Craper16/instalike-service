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

    if (user._id.toString() === userToFollow._id.toString()) {
      return {
        message: 'An error has occured',
        name: 'Conflict',
        status: 403,
      };
    }

    const alreadyFollowing = user.following.find((followedUser) => {
      return followedUser.toString() === userToFollow._id.toString();
    });

    if (alreadyFollowing) {
      return {
        message: 'User already followed',
        name: 'Already Followed',
        status: 403,
      };
    }

    user.following.push(userToFollow._id as any);
    userToFollow.followers.push(user._id as any);

    await userToFollow.save();

    const result = await user.save();

    const followers = await User.find({ _id: { $in: result.followers } });
    const following = await User.find({ _id: { $in: result.following } });

    const followersReturned = followers.map((follower) => {
      return {
        userId: follower._id,
        email: follower.email,
        username: follower.username,
        phoneNumber: follower.phoneNumber,
        countryCode: follower.countryCode,
        profilePicture: follower.profilePicture,
        fullName: follower.fullName,
      };
    });

    const followingReturned = following.map((following) => {
      return {
        userId: following._id,
        email: following.email,
        username: following.username,
        phoneNumber: following.phoneNumber,
        countryCode: following.countryCode,
        profilePicture: following.profilePicture,
        fullName: following.fullName,
      };
    });

    return {
      user: result,
      followers: followersReturned,
      following: followingReturned,
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

export const unFollowUser = async ({
  userId,
  userToUnFollowId,
}: {
  userId: string;
  userToUnFollowId: string;
}) => {
  try {
    const user = await User.findById(userId);
    const userToUnFollow = await User.findById(userToUnFollowId);

    if (!user) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    if (!userToUnFollow) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    if (user._id.toString() === userToUnFollow._id.toString()) {
      return {
        message: 'An error has occured',
        name: 'Conflict',
        status: 403,
      };
    }

    const alreadyFollowing = user.following.find((followedUser) => {
      return followedUser.toString() === userToUnFollow._id.toString();
    });

    if (!alreadyFollowing) {
      return {
        message: 'User not followed',
        name: 'Not followed',
        status: 403,
      };
    }

    const updatedFollowing = user.following.filter(
      (followedUser) =>
        followedUser.toString() !== userToUnFollow._id.toString()
    );

    const updatedFollowers = user.followers.filter(
      (follower) => follower.toString() === user._id.toString()
    );

    user.following = updatedFollowing;

    userToUnFollow.followers = updatedFollowers;

    await userToUnFollow.save();

    const result = await user.save();

    const followers = await User.find({ _id: { $in: result.followers } });
    const following = await User.find({ _id: { $in: result.following } });

    const followersReturned = followers.map((follower) => {
      return {
        userId: follower._id,
        email: follower.email,
        username: follower.username,
        phoneNumber: follower.phoneNumber,
        countryCode: follower.countryCode,
        profilePicture: follower.profilePicture,
        fullName: follower.fullName,
      };
    });

    const followingReturned = following.map((following) => {
      return {
        userId: following._id,
        email: following.email,
        username: following.username,
        phoneNumber: following.phoneNumber,
        countryCode: following.countryCode,
        profilePicture: following.profilePicture,
        fullName: following.fullName,
      };
    });

    return {
      user: result,
      followers: followersReturned,
      following: followingReturned,
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

import dayjs from 'dayjs';
import { PER_PAGE } from '../consts/constants';
import { Post } from '../models/post';
import { User } from '../models/user';
import { returnUser } from '../helpers/user';

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
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (!userToFollow) {
      return {
        message: "User doesn't exist",
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
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (!userToUnFollow) {
      return {
        message: "User doesn't exist",
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

    return {
      user: result,
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

export const getUserData = async ({ userId }: { userId: string }) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    return {
      user,
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

export const getUserFollowers = async ({ userId }: { userId: string }) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const followersPromises = user.followers.map(async (follower) => {
      try {
        const userFound = await User.findById(follower);
        return {
          userId: userFound?._id,
          email: userFound?.email,
          username: userFound?.username,
          phoneNumber: userFound?.phoneNumber,
          countryCode: userFound?.countryCode,
          profilePicture: userFound?.profilePicture,
          fullName: userFound?.fullName,
          followers: userFound?.followers,
          following: userFound?.following,
        };
      } catch (error) {
        return null;
      }
    });

    const followers = await Promise.all(followersPromises);

    return { followers, status: 200 };
  } catch (error) {
    console.error(error);
  }
};

export const getUserFollowing = async ({ userId }: { userId: string }) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const followingPromises = user.following.map(async (follower) => {
      try {
        const userFound = await User.findById(follower);
        return {
          userId: userFound?._id,
          email: userFound?.email,
          username: userFound?.username,
          phoneNumber: userFound?.phoneNumber,
          countryCode: userFound?.countryCode,
          profilePicture: userFound?.profilePicture,
          fullName: userFound?.fullName,
          followers: userFound?.followers,
          following: userFound?.following,
        };
      } catch (error) {
        return null;
      }
    });

    const following = await Promise.all(followingPromises);

    return { following, status: 200 };
  } catch (error) {
    console.error(error);
  }
};

export const getUserPosts = async ({
  userId,
  page,
}: {
  userId: string;
  page: number;
}) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const posts = await Post.paginate(
      { userId: user._id },
      { limit: PER_PAGE, page, sort: { updatedAt: -1 } }
    );

    const postsReponse = posts.docs.map(async (post) => {
      const user = await User.findById(post.userId);

      return {
        postId: post?._id,
        post: {
          post: post?.post,
          caption: post?.caption,
        },
        user: returnUser({ user }),
        postDate: dayjs((post as any)?.createdAt).fromNow(false),
      };
    });

    const docs = await Promise.all(postsReponse);

    return { status: 200, posts: { ...posts, docs } };
  } catch (error) {
    console.error(error);
  }
};

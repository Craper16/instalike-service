import { RequestHandler } from 'express';
import {
  followUser,
  getUserData,
  getUserFollowers,
  getUserFollowing,
  getUserPosts,
  unFollowUser,
} from '../services/user';
import { ErrorResponse } from '..';
import { returnUser } from '../helpers/user';

export const FollowUser: RequestHandler = async (req, res, next) => {
  const { userId } = req.params as { userId: string };

  try {
    const followUserResponse = await followUser({
      userId: req.userId,
      userToFollowId: userId,
    });

    if (followUserResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: followUserResponse?.name!,
        name: followUserResponse?.name!,
        status: followUserResponse?.status!,
        data: {
          message: followUserResponse?.message!,
          statusCode: followUserResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(followUserResponse.status).json({
      user: returnUser({ user: followUserResponse.user }),
    });
  } catch (error) {
    next(error);
  }
};

export const UnFollowUser: RequestHandler = async (req, res, next) => {
  const { userId } = req.params as { userId: string };

  try {
    const unFollowUserResponse = await unFollowUser({
      userId: req.userId,
      userToUnFollowId: userId,
    });

    if (unFollowUserResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: unFollowUserResponse?.name!,
        name: unFollowUserResponse?.name!,
        status: unFollowUserResponse?.status!,
        data: {
          message: unFollowUserResponse?.message!,
          statusCode: unFollowUserResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(unFollowUserResponse.status).json({
      user: returnUser({ user: unFollowUserResponse.user }),
    });
  } catch (error) {
    next(error);
  }
};

export const GetUserData: RequestHandler = async (req, res, next) => {
  const { userId } = req.params as { userId: string };

  try {
    const getUserDataResponse = await getUserData({ userId });

    if (getUserDataResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: getUserDataResponse?.name!,
        name: getUserDataResponse?.name!,
        status: getUserDataResponse?.status!,
        data: {
          message: getUserDataResponse?.message!,
          statusCode: getUserDataResponse?.status!,
        },
      };
      throw error;
    }
    return res.status(getUserDataResponse.status).json({
      user: returnUser({ user: getUserDataResponse.user }),
    });
  } catch (error) {
    next(error);
  }
};

export const GetUserFollowers: RequestHandler = async (req, res, next) => {
  const { userId } = req.params as { userId: string };

  try {
    const getUserFollowersResponse = await getUserFollowers({
      userId,
    });
    if (getUserFollowersResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: getUserFollowersResponse?.name!,
        name: getUserFollowersResponse?.name!,
        status: getUserFollowersResponse?.status!,
        data: {
          message: getUserFollowersResponse?.message!,
          statusCode: getUserFollowersResponse?.status!,
        },
      };
      throw error;
    }

    return res
      .status(getUserFollowersResponse.status)
      .json({ followers: getUserFollowersResponse.followers });
  } catch (error) {
    next(error);
  }
};

export const GetUserFollowing: RequestHandler = async (req, res, next) => {
  const { userId } = req.params as { userId: string };

  try {
    const getUserFollowingResponse = await getUserFollowing({
      userId,
    });
    if (getUserFollowingResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: getUserFollowingResponse?.name!,
        name: getUserFollowingResponse?.name!,
        status: getUserFollowingResponse?.status!,
        data: {
          message: getUserFollowingResponse?.message!,
          statusCode: getUserFollowingResponse?.status!,
        },
      };
      throw error;
    }

    return res
      .status(getUserFollowingResponse.status)
      .json({ following: getUserFollowingResponse.following });
  } catch (error) {
    next(error);
  }
};

export const GetUserPosts: RequestHandler = async (req, res, next) => {
  const { page } = req.query as { page: string };
  const { userId } = req.params as { userId: string };

  try {
    const getUserPostsResponse = await getUserPosts({
      page: +page || 1,
      userId,
    });

    if (getUserPostsResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: getUserPostsResponse?.name!,
        name: getUserPostsResponse?.name!,
        status: getUserPostsResponse?.status!,
        data: {
          message: getUserPostsResponse?.message!,
          statusCode: getUserPostsResponse?.status!,
        },
      };
      throw error;
    }

    return res
      .status(getUserPostsResponse.status)
      .json({ posts: getUserPostsResponse.posts });
  } catch (error) {
    next(error);
  }
};

import { RequestHandler } from 'express';
import {
  followUser,
  getUserData,
  getUserFollowers,
  getUserFollowing,
  unFollowUser,
} from '../services/user';
import { ErrorResponse } from '..';

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
      user: {
        userId: followUserResponse.user?._id,
        email: followUserResponse.user?.email,
        username: followUserResponse.user?.username,
        phoneNumber: followUserResponse.user?.phoneNumber,
        countryCode: followUserResponse.user?.countryCode,
        profilePicture: followUserResponse.user?.profilePicture,
        fullName: followUserResponse.user?.fullName,
        followers: followUserResponse.user?.followers,
        following: followUserResponse.user?.following,
      },
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
      user: {
        userId: unFollowUserResponse.user?._id,
        email: unFollowUserResponse.user?.email,
        username: unFollowUserResponse.user?.username,
        phoneNumber: unFollowUserResponse.user?.phoneNumber,
        countryCode: unFollowUserResponse.user?.countryCode,
        profilePicture: unFollowUserResponse.user?.profilePicture,
        fullName: unFollowUserResponse.user?.fullName,
        followers: unFollowUserResponse.user?.followers,
        following: unFollowUserResponse.user?.following,
      },
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
      user: {
        userId: getUserDataResponse.user?._id,
        email: getUserDataResponse.user?.email,
        username: getUserDataResponse.user?.username,
        phoneNumber: getUserDataResponse.user?.phoneNumber,
        countryCode: getUserDataResponse.user?.countryCode,
        profilePicture: getUserDataResponse.user?.profilePicture,
        fullName: getUserDataResponse.user?.fullName,
        followers: getUserDataResponse.user?.followers,
        following: getUserDataResponse.user?.following,
      },
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

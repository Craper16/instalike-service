import { RequestHandler } from 'express';
import { followUser } from '../services/follow';
import { ErrorResponse } from '../app';

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
      },
    });
  } catch (error) {
    next(error);
  }
};

import { RequestHandler } from 'express';
import { UserModel } from '../models/user';
import {
  changeUserPassword,
  editUserProfile,
  editUserProfilePicture,
  getLoggedInUserData,
  refreshUserTokens,
  removeUserProfilePicture,
  resendVerificationCode,
  resetPassword,
  signUp,
  signin,
  verify,
} from '../services/auth';
import { ErrorResponse } from '..';
import {
  changePasswordValidation,
  editUserProfileValidations,
  refreshValidations,
  resendVerificationValidation,
  resetPasswordValidation,
  signinUserValidations,
  signupUserValidations,
  verifyUserValidations,
} from '../validations/auth';
import { getUserFollowers, getUserFollowing } from '../services/user';
import { returnUser } from '../helpers/user';

export const SignupUser: RequestHandler = async (req, res, next) => {
  const body = req.body as UserModel;

  const { error } = signupUserValidations.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const signupUser = await signUp({ ...body });

    if (signupUser?.status !== 201) {
      const error: ErrorResponse = {
        message: signupUser?.name!,
        name: signupUser?.name!,
        status: signupUser?.status!,
        data: {
          message: signupUser?.message!,
          statusCode: signupUser?.status!,
        },
      };
      throw error;
    }

    return res.status(signupUser.status).json({
      message: 'Please check your email for the verification code',
    });
  } catch (error) {
    next(error);
  }
};

export const SigninUser: RequestHandler = async (req, res, next) => {
  const { emailOrUsername, password } = req.body as {
    emailOrUsername: string;
    password: string;
  };

  const { error } = signinUserValidations.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const signinUserResponse = await signin({ emailOrUsername, password });

    if (signinUserResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: signinUserResponse?.name!,
        name: signinUserResponse?.name!,
        status: signinUserResponse?.status!,
        data: {
          message: signinUserResponse?.message!,
          statusCode: signinUserResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(signinUserResponse.status).json({
      user: returnUser({ user: signinUserResponse.user }),
      access_token: signinUserResponse.access_token,
      refresh_token: signinUserResponse.refresh_token,
      expires_at: signinUserResponse.expires_at,
    });
  } catch (error) {
    next(error);
  }
};

export const VerifyUser: RequestHandler = async (req, res, next) => {
  const { email, verificationCode } = req.body as {
    email: string;
    verificationCode: number;
  };

  const { login } = req.query as { login?: string };

  const { error } = verifyUserValidations.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const verifyUser = await verify({ email, verificationCode, login });

    if (verifyUser?.status !== 200) {
      const error: ErrorResponse = {
        message: verifyUser?.name!,
        name: verifyUser?.name!,
        status: verifyUser?.status!,
        data: {
          message: verifyUser?.message!,
          statusCode: verifyUser?.status!,
        },
      };
      throw error;
    }

    if (verifyUser.access_token && verifyUser.refresh_token) {
      return res.status(200).json({
        user: returnUser({ user: verifyUser.user }),
        access_token: verifyUser.access_token,
        refresh_token: verifyUser.refresh_token,
        expires_at: verifyUser.expires_at,
        message: 'Successfully verified',
      });
    }

    return res.status(200).json({
      message: 'Successfully verified',
    });
  } catch (error) {
    next(error);
  }
};

export const ResendVerificationCode: RequestHandler = async (
  req,
  res,
  next
) => {
  const { email } = req.body as { email: string };

  const { error } = resendVerificationValidation.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const resendVerification = await resendVerificationCode({ email });

    if (resendVerification?.status !== 200) {
      const error: ErrorResponse = {
        message: resendVerification?.name!,
        name: resendVerification?.name!,
        status: resendVerification?.status!,
        data: {
          message: resendVerification?.message!,
          statusCode: resendVerification?.status!,
        },
      };
      throw error;
    }

    return res.status(resendVerification.status).json({
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const ResetPassword: RequestHandler = async (req, res, next) => {
  const { email, newPassword, verificationCode } = req.body as {
    email: string;
    newPassword: string;
    verificationCode: number;
  };

  const { error } = resetPasswordValidation.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const resetPasswordResponse = await resetPassword({
      email,
      newPassword,
      verificationCode,
    });

    if (resetPasswordResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: resetPasswordResponse?.name!,
        name: resetPasswordResponse?.name!,
        status: resetPasswordResponse?.status!,
        data: {
          message: resetPasswordResponse?.message!,
          statusCode: resetPasswordResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(resetPasswordResponse.status).json({
      user: returnUser({ user: resetPasswordResponse.user }),
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const GetLoggedInUserData: RequestHandler = async (req, res, next) => {
  try {
    const getLoggedInUserDataResponse = await getLoggedInUserData({
      userId: req.userId!,
    });

    if (getLoggedInUserDataResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: getLoggedInUserDataResponse?.name!,
        name: getLoggedInUserDataResponse?.name!,
        status: getLoggedInUserDataResponse?.status!,
        data: {
          message: getLoggedInUserDataResponse?.message!,
          statusCode: getLoggedInUserDataResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(getLoggedInUserDataResponse.status).json({
      user: returnUser({ user: getLoggedInUserDataResponse.user }),
    });
  } catch (error) {
    next(error);
  }
};

export const ChangeUserPassword: RequestHandler = async (req, res, next) => {
  const { newPassword, oldPassword } = req.body as {
    oldPassword: string;
    newPassword: string;
  };

  const { error } = changePasswordValidation.validate({
    oldPassword,
    newPassword,
  });

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const changeUserPasswordResponse = await changeUserPassword({
      newPassword,
      oldPassword,
      userId: req.userId!,
    });

    if (changeUserPasswordResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: changeUserPasswordResponse?.name!,
        name: changeUserPasswordResponse?.name!,
        status: changeUserPasswordResponse?.status!,
        data: {
          message: changeUserPasswordResponse?.message!,
          statusCode: changeUserPasswordResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(changeUserPasswordResponse.status).json({
      user: returnUser({ user: changeUserPasswordResponse.user }),
    });
  } catch (error) {
    next(error);
  }
};

export const RefreshUserTokens: RequestHandler = async (req, res, next) => {
  const { refreshToken } = req.body as { refreshToken: string };

  const { error } = refreshValidations.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const refreshUserTokensResponse = await refreshUserTokens({ refreshToken });

    if (refreshUserTokensResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: refreshUserTokensResponse?.name!,
        name: refreshUserTokensResponse?.name!,
        status: refreshUserTokensResponse?.status!,
        data: {
          message: refreshUserTokensResponse?.message!,
          statusCode: refreshUserTokensResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(refreshUserTokensResponse.status).json({
      user: returnUser({ user: refreshUserTokensResponse.user }),
      access_token: refreshUserTokensResponse.access_token,
      refresh_token: refreshUserTokensResponse.refresh_token,
      expires_at: refreshUserTokensResponse.expires_at,
    });
  } catch (error) {
    next(error);
  }
};

export const EditProfilePicture: RequestHandler = async (req, res, next) => {
  const profilePicture = req.file;

  try {
    const editProfilePictureResponse = await editUserProfilePicture({
      profilePicture,
      userId: req.userId,
    });

    if (editProfilePictureResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: editProfilePictureResponse?.name!,
        name: editProfilePictureResponse?.name!,
        status: editProfilePictureResponse?.status!,
        data: {
          message: editProfilePictureResponse?.message!,
          statusCode: editProfilePictureResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(editProfilePictureResponse.status).json({
      user: returnUser({ user: editProfilePictureResponse.user }),
    });
  } catch (error) {
    next(error);
  }
};

export const RemoveProfilePicture: RequestHandler = async (req, res, next) => {
  try {
    const removeProfilePictureResponse = await removeUserProfilePicture({
      userId: req.userId,
    });

    if (removeProfilePictureResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: removeProfilePictureResponse?.name!,
        name: removeProfilePictureResponse?.name!,
        status: removeProfilePictureResponse?.status!,
        data: {
          message: removeProfilePictureResponse?.message!,
          statusCode: removeProfilePictureResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(removeProfilePictureResponse.status).json({
      user: returnUser({ user: removeProfilePictureResponse.user }),
    });
  } catch (error) {
    next(error);
  }
};

export const EditUserProfile: RequestHandler = async (req, res, next) => {
  const { countryCode, fullName, phoneNumber, username } = req.body as {
    countryCode: string;
    fullName: string;
    phoneNumber: number;
    username: string;
  };

  const { error } = editUserProfileValidations.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }
    const editUserProfileResponse = await editUserProfile({
      countryCode,
      fullName,
      phoneNumber,
      userId: req.userId!,
      username,
    });

    if (editUserProfileResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: editUserProfileResponse?.name!,
        name: editUserProfileResponse?.name!,
        status: editUserProfileResponse?.status!,
        data: {
          message: editUserProfileResponse?.message!,
          statusCode: editUserProfileResponse?.status!,
        },
      };
      throw error;
    }

    return res.status(editUserProfileResponse.status).json({
      user: returnUser({ user: editUserProfileResponse.user }),
      message: 'Changes saved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const GetLoggedInUserFollowers: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const getLoggedInUserFollowers = await getUserFollowers({
      userId: req.userId,
    });
    if (getLoggedInUserFollowers?.status !== 200) {
      const error: ErrorResponse = {
        message: getLoggedInUserFollowers?.name!,
        name: getLoggedInUserFollowers?.name!,
        status: getLoggedInUserFollowers?.status!,
        data: {
          message: getLoggedInUserFollowers?.message!,
          statusCode: getLoggedInUserFollowers?.status!,
        },
      };
      throw error;
    }

    return res
      .status(getLoggedInUserFollowers.status)
      .json({ followers: getLoggedInUserFollowers.followers });
  } catch (error) {
    next(error);
  }
};

export const GetLoggedInUserFollowing: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const getLoggedInUserFollowing = await getUserFollowing({
      userId: req.userId,
    });
    if (getLoggedInUserFollowing?.status !== 200) {
      const error: ErrorResponse = {
        message: getLoggedInUserFollowing?.name!,
        name: getLoggedInUserFollowing?.name!,
        status: getLoggedInUserFollowing?.status!,
        data: {
          message: getLoggedInUserFollowing?.message!,
          statusCode: getLoggedInUserFollowing?.status!,
        },
      };
      throw error;
    }

    return res
      .status(getLoggedInUserFollowing.status)
      .json({ following: getLoggedInUserFollowing.following });
  } catch (error) {
    next(error);
  }
};

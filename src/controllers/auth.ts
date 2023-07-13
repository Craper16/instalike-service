import { RequestHandler } from 'express';
import { UserModel } from '../models/user';
import {
  changeUserPassword,
  editUserProfile,
  editUserProfilePicture,
  getLoggedInUserData,
  refreshUserTokens,
  resendVerificationCode,
  resetPassword,
  signUp,
  signin,
  verify,
} from '../services/auth';
import { ErrorResponse } from '../app';
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
import dayjs from 'dayjs';

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
      user: {
        email: signinUserResponse.user?.email,
        username: signinUserResponse.user?.username,
        phoneNumber: signinUserResponse.user?.phoneNumber,
        countryCode: signinUserResponse.user?.countryCode,
        profilePicture: signinUserResponse.user?.profilePicture,
        fullName: signinUserResponse.user?.fullName,
      },
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
        user: {
          email: verifyUser.user?.email,
          username: verifyUser.user?.username,
          phoneNumber: verifyUser.user?.phoneNumber,
          countryCode: verifyUser.user?.countryCode,
          profilePicture: verifyUser.user?.profilePicture,
          fullName: verifyUser.user?.fullName,
        },
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
  console.log('Hitting');
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
      user: {
        email: resetPasswordResponse.user?.email,
        username: resetPasswordResponse.user?.username,
        phoneNumber: resetPasswordResponse.user?.phoneNumber,
        countryCode: resetPasswordResponse.user?.countryCode,
        profilePicture: resetPasswordResponse.user?.profilePicture,
        fullName: resetPasswordResponse.user?.fullName,
      },
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const GetLoggedInUserData: RequestHandler = async (req, res, next) => {
  try {
    const getLoggedInUserDataResponse = await getLoggedInUserData({
      userId: req.userId,
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
      user: {
        email: getLoggedInUserDataResponse.user?.email,
        username: getLoggedInUserDataResponse.user?.username,
        phoneNumber: getLoggedInUserDataResponse.user?.phoneNumber,
        countryCode: getLoggedInUserDataResponse.user?.countryCode,
        profilePicture: getLoggedInUserDataResponse.user?.profilePicture,
        fullName: getLoggedInUserDataResponse.user?.fullName,
      },
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
      userId: req.userId,
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
      user: {
        email: changeUserPasswordResponse.user?.email,
        username: changeUserPasswordResponse.user?.username,
        phoneNumber: changeUserPasswordResponse.user?.phoneNumber,
        countryCode: changeUserPasswordResponse.user?.countryCode,
        profilePicture: changeUserPasswordResponse.user?.profilePicture,
        fullName: changeUserPasswordResponse.user?.fullName,
      },
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
      user: {
        email: refreshUserTokensResponse.user?.email,
        username: refreshUserTokensResponse.user?.username,
        phoneNumber: refreshUserTokensResponse.user?.phoneNumber,
        countryCode: refreshUserTokensResponse.user?.countryCode,
        profilePicture: refreshUserTokensResponse.user?.profilePicture,
        fullName: refreshUserTokensResponse.user?.fullName,
      },
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
      user: {
        email: editProfilePictureResponse.user?.email,
        username: editProfilePictureResponse.user?.username,
        phoneNumber: editProfilePictureResponse.user?.phoneNumber,
        countryCode: editProfilePictureResponse.user?.countryCode,
        profilePicture: editProfilePictureResponse.user?.profilePicture,
        fullName: editProfilePictureResponse.user?.fullName,
      },
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
      userId: req.userId,
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
      user: {
        email: editUserProfileResponse.user?.email,
        username: editUserProfileResponse.user?.username,
        phoneNumber: editUserProfileResponse.user?.phoneNumber,
        countryCode: editUserProfileResponse.user?.countryCode,
        profilePicture: editUserProfileResponse.user?.profilePicture,
        fullName: editUserProfileResponse.user?.fullName,
      },
      message: 'Changes saved successfully',
    });
  } catch (error) {
    next(error);
  }
};

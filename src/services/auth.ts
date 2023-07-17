import { Readable } from 'stream';
import { User } from '../models/user';
import { bucket, secret } from '../app';
import { compareSync, hashSync } from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../helpers/jwtHelpers';
import { transporter } from '../app';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import { VerificationCode } from '../models/verificationCode';

import * as jose from 'jose';
import { BlackListedToken } from '../models/blacklistedToken';
import { REFRESH_TOKEN } from '../consts/constants';
import dayjs from 'dayjs';

export const signUp = async ({
  countryCode,
  email,
  fullName,
  password,
  phoneNumber,
  username,
}: {
  countryCode: string;
  email: string;
  fullName: string;
  password: string;
  username: string;
  phoneNumber: number;
}) => {
  try {
    const userWithEmailAlreadyExists = await User.findOne({
      email: email.toLowerCase(),
    });
    const userWithPhoneNumberAlreadyExists = await User.findOne({
      phoneNumber,
      countryCode,
    });
    const userWithUsernameAlreadyExists = await User.findOne({ username });

    if (userWithEmailAlreadyExists) {
      return {
        message: 'A user with this email already exists',
        name: 'Already Exists',
        status: 409,
      };
    }
    if (userWithPhoneNumberAlreadyExists) {
      return {
        message: 'A user with this phone number already exists',
        name: 'Already Exists',
        status: 409,
      };
    }
    if (userWithUsernameAlreadyExists) {
      return {
        message: 'A user with this username already exists',
        name: 'Already Exists',
        status: 409,
      };
    }

    const hashedPassword = hashSync(password, 10);
    const code = Math.floor(Math.random() * 9000 + 1000);

    const hashedVerificationCode = hashSync(code.toString());

    const user = new User({
      countryCode,
      email: email.toLowerCase(),
      fullName,
      password: hashedPassword,
      phoneNumber,
      username: username.toLowerCase(),
      profilePicture: null,
      verified: false,
      followers: [],
      following: [],
    });

    const verificationCode = new VerificationCode({
      alreadyUsed: false,
      userId: user._id,
      verificationCode: hashedVerificationCode,
    });

    await verificationCode.save();

    const result = await user.save();

    const mailOptions: MailOptions = {
      from: process.env.NODE_MAILER_GMAIL,
      to: result.email,
      subject: 'Account activation code',
      text: `Welcome! Your verification code is: ${code}. If you did not signup for our services, please ignore this email.`,
      html: `<div><h1>Welcome!</h1><div>Your verification code is: ${code}</div><div>If you did not signup for our services, please ignore this email.</div></div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error occured', error);
      } else {
        console.log('Email sent' + info.response);
      }
    });

    return {
      user: result,
      status: 201,
    };
  } catch (error) {
    console.error(error);
  }
};

export const signin = async ({
  emailOrUsername,
  password,
}: {
  emailOrUsername: string;
  password: string;
}) => {
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });

    if (!user) {
      return {
        message: 'Please check your login credentials',
        name: 'Unauthorized',
        status: 401,
      };
    }

    const passwordIsCorrect = compareSync(password, user.password);

    if (!passwordIsCorrect) {
      return {
        message: 'Please check your login credentials',
        name: 'Unauthorized',
        status: 401,
      };
    }

    const access_token = await generateAccessToken({
      email: user.email,
      countryCode: user.countryCode,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      userId: user._id.toString(),
      username: user.username,
    });

    const refresh_token = await generateRefreshToken({
      email: user.email,
      countryCode: user.countryCode,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      userId: user._id.toString(),
      username: user.username,
    });

    const { payload } = await jose.jwtDecrypt(access_token, secret);

    const tokenExpirationDate = dayjs(payload.exp! * 1000).format(
      'YYYY-MM-DD HH:mm:ss'
    );

    const followers = await User.find({ _id: { $in: user.followers } });
    const following = await User.find({ _id: { $in: user.following } });

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
      user,
      access_token,
      refresh_token,
      followers: followersReturned,
      following: followingReturned,
      expires_at: tokenExpirationDate,
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

export const verify = async ({
  email,
  verificationCode,
  login,
}: {
  email: string;
  verificationCode: number;
  login?: string;
}) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    const userVerificationCode = await VerificationCode.findOne({
      userId: user?._id,
    });

    if (!user) {
      return {
        message: 'User does not exist',
        name: 'Not Found',
        status: 404,
      };
    }

    if (!userVerificationCode) {
      return {
        message: 'Verification code does not exist',
        name: 'Not Found',
        status: 404,
      };
    }

    if (userVerificationCode.alreadyUsed) {
      return {
        message: 'Verification code already used',
        name: 'Already Used',
        status: 403,
      };
    }

    if (user.verified && login === 'true') {
      return {
        message: 'User already verified',
        name: 'Already Verified',
        status: 403,
      };
    }

    const verificationCodesMatch = compareSync(
      verificationCode.toString(),
      userVerificationCode.verificationCode
    );

    if (!verificationCodesMatch) {
      return {
        message: 'Wrong verification code',
        name: 'Wrong Entry',
        status: 409,
      };
    }
    user.verified = true;
    userVerificationCode.alreadyUsed = true;

    await userVerificationCode.save();
    const result = await user.save();

    const access_token = await generateAccessToken({
      email: result.email,
      countryCode: result.countryCode,
      fullName: result.fullName,
      phoneNumber: result.phoneNumber,
      userId: result._id.toString(),
      username: result.username,
    });

    const refresh_token = await generateRefreshToken({
      email: result.email,
      countryCode: result.countryCode,
      fullName: result.fullName,
      phoneNumber: result.phoneNumber,
      userId: result._id.toString(),
      username: result.username,
    });

    const { payload } = await jose.jwtDecrypt(access_token, secret);

    const tokenExpirationDate = dayjs(payload.exp! * 1000).format(
      'YYYY-MM-DD HH:mm:ss'
    );

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

    if (login === 'true') {
      return {
        user: result,
        followers: followersReturned,
        following: followingReturned,
        access_token,
        refresh_token,
        expires_at: tokenExpirationDate,
        status: 200,
      };
    }

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

export const resendVerificationCode = async ({ email }: { email: string }) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    const userVerificationCode = await VerificationCode.findOne({
      userId: user?._id,
    });

    if (!user) {
      return {
        message: 'User does not exist',
        name: 'Not Found',
        status: 404,
      };
    }

    if (!userVerificationCode) {
      return {
        message: 'Verification code does not exist',
        name: 'Not Found',
        status: 404,
      };
    }

    const code = Math.floor(Math.random() * 9000 + 1000);
    const hashedVerificationCode = hashSync(code.toString());

    userVerificationCode.verificationCode = hashedVerificationCode;
    userVerificationCode.alreadyUsed = false;

    await userVerificationCode.save();

    const mailOptions: MailOptions = {
      from: process.env.NODE_MAILER_GMAIL,
      to: user.email,
      subject: 'Account activation code',
      text: `Welcome! Your verification code is: ${code}. If you did not signup for our services, please ignore this email.`,
      html: `<div><h1>Welcome!</h1><div>Your verification code is: ${code}</div><div>If you did not signup for our services, please ignore this email.</div></div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error occured', error);
      } else {
        console.log('Email sent' + info.response);
      }
    });

    return {
      user,
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

export const resetPassword = async ({
  email,
  newPassword,
  verificationCode,
}: {
  email: string;
  verificationCode: number;
  newPassword: string;
}) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        message: 'Invalid credentials',
        name: 'Unauthorized',
        status: 401,
      };
    }

    const userVerificationCode = await VerificationCode.findOne({
      userId: user._id,
    });

    if (!userVerificationCode) {
      return {
        message: 'Verification code does not exist',
        name: 'Not Found',
        status: 404,
      };
    }

    const verificationCodesMatch = compareSync(
      verificationCode.toString(),
      userVerificationCode.verificationCode
    );

    if (!verificationCodesMatch) {
      return {
        message: 'Wrong verification code',
        name: 'Wrong Entry',
        status: 409,
      };
    }

    const hashedNewPassword = hashSync(newPassword, 12);

    user.password = hashedNewPassword;

    userVerificationCode.alreadyUsed = true;
    await userVerificationCode.save();

    const result = await user.save();

    const followers = await User.find({ _id: { $in: user.followers } });
    const following = await User.find({ _id: { $in: user.following } });

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
      status: 200,
      user: result,
      followers: followersReturned,
      following: followingReturned,
    };
  } catch (error) {
    console.log(error);
  }
};

export const getLoggedInUserData = async ({ userId }: { userId: string }) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: 'User does not exist',
        name: 'Not Found',
        status: 404,
      };
    }

    const followers = await User.find({ _id: { $in: user.followers } });
    const following = await User.find({ _id: { $in: user.following } });

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
      user,
      status: 200,
      followers: followersReturned,
      following: followingReturned,
    };
  } catch (error) {
    console.error(error);
  }
};

export const changeUserPassword = async ({
  newPassword,
  oldPassword,
  userId,
}: {
  userId: string;
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    const isOldPasswordCorrect = await compareSync(oldPassword, user.password);

    if (!isOldPasswordCorrect) {
      return {
        message: 'Incorrect old password',
        name: 'Wrong Entry',
        status: 409,
      };
    }

    const hashedNewpassword = await hashSync(newPassword, 12);

    user.password = hashedNewpassword;

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
      message: 'Password changed successfully',
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

export const refreshUserTokens = async ({
  refreshToken,
}: {
  refreshToken: string;
}) => {
  try {
    const refreshTokenAlreadyUsed = await BlackListedToken.findOne({
      blackListedToken: refreshToken,
    });

    if (refreshTokenAlreadyUsed) {
      return {
        message: 'Invalid token',
        name: 'Invalid',
        status: 401,
      };
    }

    let decodedToken;

    try {
      const { payload } = await jose.jwtDecrypt(refreshToken, secret);
      decodedToken = payload;
    } catch (error) {
      const { message, name } = error as Error;
      return {
        message: message,
        name: name,
        status: 401,
      };
    }

    if (decodedToken.grant_type !== REFRESH_TOKEN) {
      return {
        message: 'Invalid token',
        name: 'Invalid',
        status: 401,
      };
    }

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    const access_token = await generateAccessToken({
      countryCode: user.countryCode,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      userId: user._id.toString(),
      username: user.username,
    });

    const refresh_token = await generateRefreshToken({
      countryCode: user.countryCode,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      userId: user._id.toString(),
      username: user.username,
    });

    const { payload } = await jose.jwtDecrypt(access_token, secret);

    const tokenExpirationDate = dayjs(payload.exp! * 1000).format(
      'YYYY-MM-DD HH:mm:ss'
    );
    new BlackListedToken({
      blackListedToken: refreshToken,
    }).save();

    const followers = await User.find({ _id: { $in: user.followers } });
    const following = await User.find({ _id: { $in: user.following } });

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
      user,
      followers: followersReturned,
      following: followingReturned,
      access_token,
      refresh_token,
      expires_at: tokenExpirationDate,
      status: 200,
    };
  } catch (error) {
    console.error;
  }
};

export const editUserProfilePicture = async ({
  profilePicture,
  userId,
}: {
  userId: string;
  profilePicture: Express.Multer.File | undefined;
}) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    if (!profilePicture) {
      return {
        message: 'Invalid profile picture',
        name: 'Invalid',
        status: 409,
      };
    }

    const readableStream = new Readable();
    readableStream.push(profilePicture.buffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(user._id.toString());
    const id = uploadStream.id;

    readableStream.pipe(uploadStream);

    const uploadPromise = new Promise((resolve, reject) => {
      uploadStream.on('error', () => {
        reject({
          message: 'Could not upload file to S3',
          status: 403,
          name: 'Upload Failed',
        });
      });

      uploadStream.on('finish', () => {
        resolve(() => {});
      });
    });

    await uploadPromise;

    const imgUrl = `http://192.168.1.113:5051/file/${id}`;
    user.profilePicture = imgUrl;
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

export const removeUserProfilePicture = async ({
  userId,
}: {
  userId: string;
}) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    user.profilePicture = null as any;

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

export const editUserProfile = async ({
  countryCode,
  fullName,
  phoneNumber,
  username,
  userId,
}: {
  username: string;
  fullName: string;
  countryCode: string;
  phoneNumber: number;
  userId: string;
}) => {
  try {
    const user = await User.findById(userId);
    const userWithSameUsername = await User.findOne({ username });

    if (!user) {
      return {
        message: 'User does not exist',
        name: 'Not Found',
        status: 404,
      };
    }

    if (
      userWithSameUsername &&
      userWithSameUsername?._id.toString() !== user._id.toString()
    ) {
      return {
        message: 'A user with this username already exists',
        name: 'Already Exists',
        status: 409,
      };
    }

    user.username = username;
    user.phoneNumber = phoneNumber;
    user.countryCode = countryCode;
    user.fullName = fullName;

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

export const getUserData = async ({ userId }: { userId: string }) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        message: 'User doesnt exist',
        name: 'Not Found',
        status: 404,
      };
    }

    const followers = await User.find({ _id: { $in: user.followers } });
    const following = await User.find({ _id: { $in: user.following } });

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
      user,
      followers: followersReturned,
      following: followingReturned,
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
};

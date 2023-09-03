import { Router } from 'express';
import {
  ChangeUserPassword,
  EditProfilePicture,
  EditUserProfile,
  GetLoggedInUserData,
  GetLoggedInUserFollowers,
  GetLoggedInUserFollowing,
  RefreshUserTokens,
  RemoveProfilePicture,
  ResendVerificationCode,
  ResetPassword,
  SigninUser,
  SignupUser,
  VerifyUser,
} from '../controllers/auth';
import multer, { memoryStorage } from 'multer';
import { isAuth } from '../middlewares/isAuth';
import Aws from 'aws-sdk';

export const upload = multer({
  storage: memoryStorage(),
  fileFilter(req, file, callback) {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png'
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
});

export const s3 = new Aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_S3_ID,
    secretAccessKey: process.env.AWS_S3_SECRET,
  },
});

const router = Router();

router.post('/signup', SignupUser);

router.post('/signin', SigninUser);

router.put('/verify', VerifyUser);

router.put('/resend-verification-code', ResendVerificationCode);

router.put('/reset-password', ResetPassword);

router.get('/me', isAuth, GetLoggedInUserData);

router.put('/me/change-password', isAuth, ChangeUserPassword);

router.post('/refresh', RefreshUserTokens);

router.post(
  '/me/edit-profile-picture',
  isAuth,
  upload.single('profilePicture'),
  EditProfilePicture
);

router.delete('/me/remove-profile-picture', isAuth, RemoveProfilePicture);

router.put('/me/edit-profile', isAuth, EditUserProfile);

router.get('/me/followers', isAuth, GetLoggedInUserFollowers);

router.get('/me/following', isAuth, GetLoggedInUserFollowing);

export default router;

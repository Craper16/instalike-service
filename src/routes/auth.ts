import { Router } from 'express';
import {
  ChangeUserPassword,
  EditProfilePicture,
  EditUserProfile,
  GetLoggedInUserData,
  RefreshUserTokens,
  ResendVerificationCode,
  ResetPassword,
  SigninUser,
  SignupUser,
  VerifyUser,
} from '../controllers/auth';
import multer, { memoryStorage } from 'multer';
import { isAuth } from '../middlewares/isAuth';

export const upload = multer({ storage: memoryStorage() });

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

router.put('/me/edit-profile', isAuth, EditUserProfile);

router.get('/:userId', isAuth);

export default router;

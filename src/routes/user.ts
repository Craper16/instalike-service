import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import {
  FollowUser,
  GetUserData,
  GetUserFollowers,
  GetUserFollowing,
  GetUserPosts,
  UnFollowUser,
} from '../controllers/user';

const router = Router();

router.post('/follow/:userId', isAuth, FollowUser);

router.post('/unfollow/:userId', isAuth, UnFollowUser);

router.get('/:userId', isAuth, GetUserData);

router.get('/followers/:userId', isAuth, GetUserFollowers);

router.get('/following/:userId', isAuth, GetUserFollowing);

router.get('/posts/:userId', isAuth, GetUserPosts);

export default router;

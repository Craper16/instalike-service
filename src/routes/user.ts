import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import { FollowUser, GetUserData, UnFollowUser } from '../controllers/user';

const router = Router();

router.post('/follow/:userId', isAuth, FollowUser);

router.post('/unfollow/:userId', isAuth, UnFollowUser);

router.get('/:userId', isAuth, GetUserData);

export default router;

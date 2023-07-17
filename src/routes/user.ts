import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import { FollowUser, UnFollowUser } from '../controllers/user';

const router = Router();

router.post('/follow/:userId', isAuth, FollowUser);

router.post('/unfollow/:userId', isAuth, UnFollowUser);

export default router;

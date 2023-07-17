import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import { FollowUser } from '../controllers/follow';

const router = Router();

router.post('/:userId', isAuth, FollowUser);

router.post('/', isAuth);

export default router;

import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import { GetLikes, PostLike, RemoveLike } from '../controllers/like';

const router = Router();

router.post('/', isAuth, PostLike);

router.delete('/', isAuth, RemoveLike);

router.get('/all', isAuth, GetLikes);

export default router;

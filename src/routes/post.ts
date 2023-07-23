import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';

const router = Router();

router.get('/', isAuth);

router.post('/', isAuth);

router.put('/:postId', isAuth);

router.delete('/:postId', isAuth);

export default router;

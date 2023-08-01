import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import multer, { memoryStorage } from 'multer';
import { DeletePost, EditPost, GetPost, Post } from '../controllers/post';

const router = Router();

export const upload = multer({ storage: memoryStorage() });

router.get('/', isAuth);

router.get('/:postId', isAuth, GetPost);

router.post('/', isAuth, upload.array('posts'), Post);

router.put('/:postId', isAuth, upload.array('posts'), EditPost);

router.delete('/:postId', isAuth, DeletePost);

export default router;

import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import {
  DeleteComment,
  EditComment,
  GetComment,
  PostComment,
} from '../controllers/comment';

const router = Router();

router.get('/:commentId', isAuth, GetComment);

router.post('/', isAuth, PostComment);

router.put('/:commentId', isAuth, EditComment);

router.delete('/:commentId', isAuth, DeleteComment);

export default router;

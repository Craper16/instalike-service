import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import { SearchUsers } from '../controllers/search';

const router = Router();

router.get('/', isAuth, SearchUsers);

export default router;

import { Router } from "express";
import { getUsers } from "../controllers/adminController";
import authenticate from "../middleware/authenticated";

const router = Router();
router.use(authenticate('ADMIN'));
// register
router.get('/users', getUsers);

export default router;
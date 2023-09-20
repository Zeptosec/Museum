import { Router } from "express";
import { getUsers, setRole } from "../controllers/adminController";
import authenticate from "../middleware/authenticated";

const router = Router();
router.use(authenticate(['ADMIN']));
// register
router.get('/users', getUsers);
// change role
router.patch('/role', setRole);

export default router;
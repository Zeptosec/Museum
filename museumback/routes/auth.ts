import { Router } from "express";
import { login, refresh, register } from "../controllers/authController";

const router = Router();

// register
router.post('/register', register);

// login
router.post('/login', login);

// refresh
router.post('/refresh', refresh);

export default router;
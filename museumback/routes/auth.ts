import { Router } from "express";
import { login, register } from "../controllers/authController";

const router = Router();

// register
router.post('/register', register);

// login
router.post('/login', login);

export default router;
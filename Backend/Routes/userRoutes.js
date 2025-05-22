import express from 'express';
import { registerUser, loginUser, guestLogin } from '../Controllers/user.controller.js'; 

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/guest-login', guestLogin);

export default router;
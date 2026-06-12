import express from 'express';
import {
    register, signIn, logout, isAuthenticated,
    sendResetToken, verifyResetToken, resetPassword,
} from '../controllers/Auth.js';
import userAuth from '../middlewares/userAuth.js';
import { validate } from '../middlewares/validate.js';
import {
    registerSchema, signinSchema,
    emailSchema, resetPassSchema, tokenSchema,
} from '../validators/authValidators.js';

const authRouter = express.Router();

authRouter.post('/register',           validate(registerSchema),  register);
authRouter.post('/signin',             validate(signinSchema),    signIn);
authRouter.post('/logout',                                        logout);
authRouter.get ('/is-auth',            userAuth,                  isAuthenticated);

authRouter.post('/send-reset-token',   validate(emailSchema),     sendResetToken);
authRouter.post('/verify-reset-token', validate(tokenSchema),     verifyResetToken);
authRouter.post('/reset-password',     validate(resetPassSchema), resetPassword);

export default authRouter;
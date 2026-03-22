// routes/user.route.js
import express from 'express';
import { UserControllers } from './admin.controller';

const router = express.Router();

router.get('/get-all-users', UserControllers.getAllUsers);

export const AdminRoutes = router;
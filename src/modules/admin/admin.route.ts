// routes/admin.route.js
import express from 'express';
import { AdminControllers } from './admin.controller';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/get-all-users', checkAuth(Role.ADMIN), AdminControllers.getAllUsers);
router.get('/get-total-revenue', checkAuth(Role.ADMIN), AdminControllers.getTotalRevenue);
router.get('/get-admin-stat', checkAuth(Role.ADMIN), AdminControllers.getAdminStat);
router.patch('/toggle-user-status/:id', checkAuth(Role.ADMIN), AdminControllers.toggleUserBlockStatus);
router.delete('/delete-user/:id', checkAuth(Role.ADMIN), AdminControllers.deleteUser);

export const AdminRoutes = router;
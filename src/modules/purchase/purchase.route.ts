import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { PaymentController } from "./purchase.controller";

const router = express.Router();

router.post(
    "/checkout",
    checkAuth(Role.ADMIN, Role.MEMBER),
    PaymentController.createCheckoutSession
);

export const PaymentRoutes = router;
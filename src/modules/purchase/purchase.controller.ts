/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { PaymentService } from "./purchase.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const { ideaId } = req.body;
    const url = await PaymentService.createCheckoutSession(ideaId, req.user);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Checkout session created successfully",
        data: { url }
    });
});

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET;
    console.log("Webhook Body Received:", req.body);
    if (!signature || !webhookSecret) {
        return res.status(status.BAD_REQUEST).json({ message: "Invalid webhook request" });
    }

    let event;
    try {
        console.log(Buffer.isBuffer(req.body))
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
        );
    } catch (error: any) {
        console.error("❌ Webhook Signature Error:", error.message);
        return res.status(status.BAD_REQUEST).send(`Webhook Error: ${error.message}`);
    }

    const result = await PaymentService.handlerStripeWebhookEvent(event);
    res.status(status.OK).json({ received: true, result });
});

export const PaymentController = {
    handleStripeWebhookEvent,
    createCheckoutSession
};
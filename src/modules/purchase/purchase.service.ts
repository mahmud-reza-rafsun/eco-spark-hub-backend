/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { PaymentStatus } from "@prisma/client";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../shared/utils/email";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { generateInvoice } from "./generateInvoice";

const createCheckoutSession = async (ideaId: string, user: any) => {
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });

    if (!idea || !idea.price) {
        throw new Error("Idea not found or price not set");
    }

    const purchase = await prisma.purchase.create({
        data: {
            ideaId: idea.id,
            userId: user.id,
            amount: idea.price,
            transactionId: `pending_${Date.now()}`,
            status: PaymentStatus.UNPAID
        }
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: user.email,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: idea.title,
                        description: "Access to digital idea details",
                        images: idea.images
                            ? [idea.images]
                            : ["https://i.ibb.co.com/k2zKW3BH/concept-of-no-items-found.jpg"],
                    },
                    unit_amount: Math.round(idea.price * 100),
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        metadata: {
            purchaseId: purchase.id,
            ideaId: idea.id,
            userId: user.id
        },
        success_url: `${envVars.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envVars.FRONTEND_URL}/payment-cancel`,
    });

    return session.url;
};


const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
    const existingPayment = await prisma.purchase.findFirst({
        where: { stripeEventId: event.id }
    });
    if (existingPayment) return { message: "Already processed" };

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const { purchaseId } = session.metadata || {};

            if (!purchaseId) throw new Error("Missing purchaseId in metadata");

            const purchaseData = await prisma.purchase.findUnique({
                where: { id: purchaseId },
                include: { user: true, idea: true }
            });

            if (!purchaseData) throw new Error("Purchase record not found");

            let invoiceUrl: string | null = null;
            let pdfBuffer: Buffer | null = null;

            if (session.payment_status === "paid") {
                try {
                    // Invoice Generate
                    pdfBuffer = await generateInvoice({
                        invoiceId: purchaseId,
                        userName: purchaseData.user.name || "Customer",
                        userEmail: purchaseData.user.email,
                        ideaTitle: purchaseData.idea.title,
                        amount: purchaseData.amount,
                        transactionId: session.id,
                        paymentDate: new Date().toISOString()
                    });

                    // Upload to Cloudinary
                    const cloudinaryResponse = await uploadFileToCloudinary(
                        pdfBuffer,
                        `eco-spark-hub/invoices/invoice-${purchaseId}.pdf`
                    );
                    invoiceUrl = cloudinaryResponse?.secure_url;
                } catch (error) {
                    console.error("⚠️ Invoice/Cloudinary Error:", error);
                }
                const result = await prisma.$transaction(async (tx) => {
                    return await tx.purchase.update({
                        where: { id: purchaseId },
                        data: {
                            status: PaymentStatus.PAID,
                            paymentGatewayData: session as any,
                            stripeEventId: event.id,
                            invoiceUrl: invoiceUrl
                        },
                        include: { user: true, idea: true }
                    });
                });

                await sendEmail({
                    to: result.user.email,
                    subject: `Purchase Confirmation: ${result.idea.title}`,
                    templateName: "invoice",
                    templateData: {
                        userName: result.user.name,
                        ideaTitle: result.idea.title,
                        amount: result.amount,
                        invoiceUrl: invoiceUrl || "",
                        transactionId: session.id
                    },
                    attachments: pdfBuffer ? [{
                        filename: `Invoice-${result.idea.title}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }] : []
                });
            }
            break;
        }

        case "checkout.session.expired":
        case "payment_intent.payment_failed": {
            const session = event.data.object as any;
            const purchaseId = session.metadata?.purchaseId;
            if (purchaseId) {
                await prisma.purchase.update({
                    where: { id: purchaseId },
                    data: { status: PaymentStatus.UNPAID }
                });
            }
            break;
        }
    }
    return { success: true };
};

export const PaymentService = {
    createCheckoutSession,
    handlerStripeWebhookEvent
};
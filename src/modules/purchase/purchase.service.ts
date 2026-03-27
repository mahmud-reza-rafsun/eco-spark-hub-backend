/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import { generateInvoice } from "./generateInvoice";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { sendEmail } from "../../shared/utils/email";
import { envVars } from "../../config/env";

const createCheckoutSession = async (ideaId: string, user: any) => {
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });

    if (!idea || !idea.price) throw new Error("Idea or Price not found");
    if (idea.authorId === user.id) throw new Error("You cannot buy your own idea!");

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: user.email,
        line_items: [{
            price_data: {
                currency: "usd",
                product_data: { name: idea.title },
                unit_amount: Math.round(idea.price * 100),
            },
            quantity: 1,
        }],
        mode: "payment",
        metadata: { ideaId: idea.id, userId: user.id, amount: idea.price.toString() },
        success_url: `${envVars.FRONTEND_URL}/dashboard?status=success`,
        cancel_url: `${envVars.FRONTEND_URL}/ideas/${ideaId}`,
    });

    return session.url;
};

const handleWebhook = async (event: Stripe.Event) => {
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { ideaId, userId, amount } = session.metadata || {};

        if (session.payment_status === "paid" && ideaId && userId) {
            try {
                const result = await prisma.purchase.upsert({
                    where: {
                        userId_ideaId: { userId, ideaId }
                    },
                    update: {
                        status: PaymentStatus.PAID,
                        transactionId: session.id,
                        amount: parseFloat(amount || "0"),
                        stripeEventId: event.id,
                        paymentGatewayData: session as any,
                    },
                    create: {
                        ideaId,
                        userId,
                        amount: parseFloat(amount || "0"),
                        transactionId: session.id,
                        stripeEventId: event.id,
                        status: PaymentStatus.PAID,
                        paymentGatewayData: session as any,
                    },
                    include: { user: true, idea: true }
                });

                console.log(`💰 Payment Processed: ${result.id}`);

                const rawPdf = await generateInvoice({
                    invoiceId: result.id,
                    userName: result.user.name || "Customer",
                    userEmail: result.user.email,
                    ideaTitle: result.idea.title,
                    amount: result.amount,
                    transactionId: session.id,
                    paymentDate: new Date().toLocaleDateString()
                });

                const pdfBuffer = Buffer.from(rawPdf);

                const cloudinaryResponse = await uploadFileToCloudinary(pdfBuffer, `invoices/${result.id}.pdf`);
                const invoiceUrl = cloudinaryResponse?.secure_url;
                console.log("Cloudinary URL:", invoiceUrl);
                await sendEmail({
                    to: result.user.email,
                    subject: "Order Confirmation - EcoSpark Hub",
                    templateName: "invoice",
                    templateData: {
                        userName: result.user.name,
                        ideaTitle: result.idea.title,
                        amount: result.amount,
                        transactionId: session.id,
                        invoiceUrl: invoiceUrl || "",
                        appName: "EcoSpark Hub",
                        year: new Date().getFullYear(),
                        supportEmail: "support@ecospark.com"
                    },
                    attachments: [
                        {
                            filename: "Invoice.pdf",
                            content: pdfBuffer,
                            contentType: "application/pdf"
                        }
                    ]
                });

                if (invoiceUrl) {
                    await prisma.purchase.update({
                        where: { id: result.id },
                        data: { invoiceUrl: invoiceUrl }
                    });
                }

            } catch (error) {
                console.error("❌ Webhook Process Error:", error);
            }
        }
    }
};

export const PaymentService = { createCheckoutSession, handleWebhook };
import PDFDocument from "pdfkit";
import { IInvoiceData } from "../../interface/invoice.interface";


export const generateInvoice = async (data: IInvoiceData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        // Header
        doc.fillColor("#444444")
            .fontSize(20)
            .text("EcoSpark Hub", 50, 57)
            .fontSize(10)
            .text("Innovation Marketplace", 50, 80)
            .text(`Invoice # ${data.invoiceId}`, 200, 50, { align: "right" })
            .text(`Date: ${new Date(data.paymentDate).toLocaleDateString()}`, 200, 65, { align: "right" })
            .moveDown();

        doc.moveTo(50, 100).lineTo(550, 100).stroke();

        // Customer Info
        doc.fontSize(12)
            .text(`Bill To:`, 50, 130)
            .fontSize(10)
            .text(data.userName, 50, 145)
            .text(data.userEmail, 50, 160)
            .moveDown();

        // Table Header
        const tableTop = 200;
        doc.fontSize(11).font("Helvetica-Bold");
        doc.text("Item (Idea Title)", 50, tableTop);
        doc.text("Transaction ID", 250, tableTop);
        doc.text("Amount", 450, tableTop, { align: "right" });

        doc.moveTo(50, 215).lineTo(550, 215).stroke();

        // Table Content
        doc.font("Helvetica").fontSize(10);
        doc.text(data.ideaTitle, 50, tableTop + 25);
        doc.text(data.transactionId, 250, tableTop + 25);
        doc.text(`$${data.amount.toFixed(2)}`, 450, tableTop + 25, { align: "right" });

        doc.moveTo(50, 260).lineTo(550, 260).stroke();

        // Total
        doc.fontSize(12).font("Helvetica-Bold")
            .text(`Total Paid: $${data.amount.toFixed(2)}`, 400, 280, { align: "right" });

        // Footer
        doc.fontSize(10).font("Helvetica-Oblique")
            .text("Thank you for supporting innovation on EcoSpark Hub!", 50, 700, { align: "center", width: 500 });

        doc.end();
    });
};
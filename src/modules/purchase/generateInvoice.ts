import puppeteer from 'puppeteer';

export const generateInvoice = async (data: {
    invoiceId: string;
    userName: string;
    userEmail: string;
    ideaTitle: string;
    amount: number;
    transactionId: string;
    paymentDate: string;
}) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 50px; margin: 0; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366f1; padding-bottom: 30px; }
            .brand h1 { color: #6366f1; margin: 0; font-size: 32px; font-weight: 800; }
            .invoice-info { text-align: right; font-size: 13px; color: #64748b; }
            
            .billing-section { margin-top: 40px; display: flex; justify-content: space-between; }
            .bill-to h3 { font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 10px; }
            .bill-to p { margin: 4px 0; font-weight: 600; font-size: 15px; }

            .table-container { margin-top: 50px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; } /* Fixed Layout prevents overlapping */
            th { background-color: #f8fafc; text-align: left; padding: 15px; color: #64748b; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 20px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-size: 14px; }

            .col-item { width: 45%; font-weight: 600; color: #0f172a; }
            .col-txid { width: 40%; word-break: break-all; font-size: 11px; color: #71717a; font-family: monospace; }
            .col-amount { width: 15%; text-align: right; font-weight: 700; color: #6366f1; font-size: 16px; }

            .summary { margin-top: 40px; display: flex; justify-content: flex-end; }
            .total-card { background: #6366f1; color: white; padding: 25px; border-radius: 12px; width: 220px; text-align: right; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }
            .total-card span { display: block; font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
            .total-card h2 { margin: 0; font-size: 24px; font-weight: 800; }

            .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="brand">
                <h1>EcoSpark Hub</h1>
                <p style="margin: 5px 0 0; font-size: 14px; color: #94a3b8;">Innovation Marketplace</p>
            </div>
            <div class="invoice-info">
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">INVOICE</p>
                <p style="margin: 5px 0;">#${data.invoiceId.slice(0, 12)}</p>
                <p style="margin: 0;">Date: ${data.paymentDate}</p>
            </div>
        </div>

        <div class="billing-section">
            <div class="bill-to">
                <h3>Billed To</h3>
                <p>${data.userName}</p>
                <p style="font-weight: 400; color: #64748b;">${data.userEmail}</p>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="col-item">DESCRIPTION</th>
                        <th class="col-txid">TRANSACTION ID</th>
                        <th class="col-amount">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="col-item">${data.ideaTitle}</td>
                        <td class="col-txid">${data.transactionId}</td>
                        <td class="col-amount">$${data.amount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="summary">
            <div class="total-card">
                <span>Amount Paid (USD)</span>
                <h2>$${data.amount.toFixed(2)}</h2>
            </div>
        </div>

        <div class="footer">
            <p>This is a system-generated invoice for your purchase at EcoSpark Hub.</p>
            <p>&copy; 2026 EcoSpark Hub. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer;
};
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import getBestTargetEmail from './validation.js';
import getPitchTemplate from './template.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


export const sendSingleEmail = async ({ to, subject, htmlContent }) => {
  const mailOptions = {
    from: `"Daniel" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  return await transporter.sendMail(mailOptions);
};


export const sendBatchEmails = async (leads, chunkSize = 5, delayMs = 3000) => {
  const results = { successful: [], failed: [] };

  for (let i = 0; i < leads.length; i += chunkSize) {
    const chunk = leads.slice(i, i + chunkSize);

    const emailPromises = chunk.map(async (lead) => {
      const htmlBody = getPitchTemplate(lead);
      const subject = `I built this for ${lead.company || lead.name} (could bring more customers)`;

      try {
        const info = await sendSingleEmail({
          to: getBestTargetEmail(lead.email),
          subject,
          htmlContent: htmlBody,
        });

        results.successful.push({
          email: lead.email,
          messageId: info.messageId,
        });
        console.log(`[SUCCESS] Email sent to: ${lead.email}`);
      } catch (error) {
        results.failed.push({ email: lead.email, error: error.message });
        console.error(`[FAILED] Email error for ${lead.email}:`, error.message);
      }
    });

    await Promise.all(emailPromises);

    if (i + chunkSize < leads.length) {
      console.log(`Pausing for ${delayMs / 1000} seconds before next chunk...`);
      await sleep(delayMs);
    }
  }

  return results;
};

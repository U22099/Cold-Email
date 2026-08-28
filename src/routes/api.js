import express from "express";
import { sendBatchEmails } from "../utils/mailer.js";

const router = express.Router();

router.post("/send-batch-emails", async (req, res) => {
  const { leads } = req.body;

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Please provide an array of leads with valid emails.",
    });
  }

  try {
    const summary = await sendBatchEmails(leads, 5, 3000);

    return res.status(200).json({
      success: true,
      message: "Batch email processing completed.",
      summary,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
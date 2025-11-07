import express from 'express';

const router = express.Router();

// /send endpoint: will attempt to send via SMTP if MAIL_* env vars are configured.
// Otherwise it will log and return a dev-success response.
router.post('/', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
    }

    // If SMTP config present, try to send via nodemailer (loaded dynamically)
    const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env;

    if (MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS) {
      // load nodemailer dynamically so server doesn't crash if dependency not installed
      const nodemailerPkg = await import('nodemailer').catch(() => null);
      if (!nodemailerPkg) {
        console.error('SMTP configured but nodemailer is not installed');
        return res.status(500).json({ error: 'SMTP configured but nodemailer module is not installed on the server' });
      }

      const nodemailer = nodemailerPkg.default || nodemailerPkg;

      // create transporter
      const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: Number(MAIL_PORT),
        secure: Number(MAIL_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASS,
        }
      });

      const mailOptions = {
        from: MAIL_FROM || MAIL_USER,
        to,
        subject,
        text: message,
        html: message.replace(/\n/g, '<br/>')
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info);
        return res.json({ ok: true, info });
      } catch (sendErr) {
        console.error('Error sending email via SMTP:', sendErr);
        return res.status(502).json({ error: 'Failed to send email via SMTP', details: sendErr.message });
      }
    }

    // DEV fallback: log and return success so frontend continues to work in local dev
    console.log('Email send request (dev):', { to, subject, message });
    return res.json({ ok: true, message: 'Email queued (dev-only)' });
  } catch (err) {
    console.error('Error in /send route:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;

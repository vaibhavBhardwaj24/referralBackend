import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_MAIL,
    pass: process.env.GMAIL_PASS,
  },
});

export const referralSender = async ({ reffId, email, name }) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173/";

  const info = await transporter.sendMail({
    to: email,
    subject: `You have a refferal from ${name}`,
    html: `
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        "
      >
        <div style="width: 100%; max-width: 600px; padding: 20px; text-align: left; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
          <p>You have been reffered by ${name} for a course. click the link below to access</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 14px; color: #777;">
            Reffered course
            <a 
              href="${frontendUrl}register?referralId=${reffId}" 
              style="color: #007BFF; text-decoration: none;"
            >
              Click here
            </a>
          </p>
        </div>
      </div>
    `,
  });

  // console.log("Email sent:", info);

  return info;
};

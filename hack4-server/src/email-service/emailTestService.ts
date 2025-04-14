import nodemailer from "nodemailer";

export async function sendTestEmail(userEmail: string, message: string) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const mailOptions = {
    from: `"ChatBot Support" <${testAccount.user}>`,
    to: "support@yourchat.com", // You can also echo back to userEmail
    subject: "ChatBot: User Needs Help",
    text: `From: ${userEmail}\n\nMessage:\n${message}`,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("📬 Test email sent!");
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
}

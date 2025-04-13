import nodemailer from "nodemailer";

export const sendEmailService = async ({
  to = "",
  subject = "Email verification",
  htmlMessage = "",
  attachments = [],
} = {}) => {
  //transporter configuration
  const transporter = nodemailer.createTransport({

    service: "gmail",
    auth: {
      user: "yoka91011@gmail.com",
      pass: "ealmvuobmzoboikf",
    },
  });

  //message configuration
  const mailOptions = {
    from: '"ZenCare" <yoka91011@gmail.com', // sender address
    to, // list of receivers
    subject, // Subject line
    html: htmlMessage,
    attachments, // file attachments
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

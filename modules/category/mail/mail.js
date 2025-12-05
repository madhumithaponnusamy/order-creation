const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "madhumitha0244@gmail.com",
        pass: "xxce zbon jdwh bvmy",
    },
});

async function sendMail(to, subject, message) {
    try {
        let result = await transporter.sendMail({
            from: "madhumitha0244@gmail.com",
            to: to,
            subject: subject,
            text: message,
        });
         console.log("✔ Mail sent successfully:", result);
        return result
    } catch (error) {
        console.error("❌ Error sending mail:", error);
        return error
    }
}


module.exports = sendMail
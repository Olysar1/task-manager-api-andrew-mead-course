const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "giorgibarbakadze25@gmail.com",
    subject: "Thanks for joining!",
    text: `Welcome to the app ${name}. Let me know how you get along with the app.`,
  });
};

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "giorgibarbakadze25@gmail.com",
    subject: "we're sorry to see you leave",
    text: `Dear ${name}, \n Please help us understand what caused you to leave to further improve our application`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail,
};

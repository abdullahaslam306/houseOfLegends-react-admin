let nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const smtpAuth = require("../config").smtpAuth;
const AWS = require('aws-sdk')

const sendEmail = async (mailDetails) => {
    const ses = new AWS.SES({region: 'us-west-1'});

  const transporter = nodemailer.createTransport({
    SES: ses,
  });

  try {
     var source = fs.readFileSync(
    path.join(__dirname, "../templates/email.hbs"),
    "utf8"
  );
   var template = Handlebars.compile(source);
    await transporter.sendMail({
      from: 'store@gems.houseoflegends.io', 
      to: mailDetails.to,
      subject: mailDetails.subject,
      html: template(mailDetails.templateObj)
      });

  } catch (error) {
    console.error('error sending email:' ,error);
  }
};
const sendCouponEmail = async (email, name, coupon) => {
  sendEmail({
    from: "HoL Store",
    to: email,
    subject: "HoL store notification - TEST ONLY",
    templateObj: {
      emailText: `<p>Hi Legend, ${name}! You have purchased the a perk and your coupon number is: ${coupon}.</p>
       <p>Use this coupon upon checkout.</p>
       <p>This is for testing purposes only.</p>`,
    },
  });
};

module.exports = {
  sendCouponEmail,
};

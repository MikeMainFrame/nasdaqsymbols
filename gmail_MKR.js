

exports.memail = async function ( subject, html, who ) {

  const nodemailer = require( "nodemailer" );
  const logExpel = require( './logExpel.js' );

  let transporter = nodemailer.createTransport( {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'miketriticum@gmail.com',
      pass: process.env.mike,
    },

  } );

  // send mail with defined transport object
  let info = await transporter.sendMail( {
    from: 'Michael Rasch <miketriticum@gmail.com>',
    to: who,
    subject: subject,
    //text: "Hello world?", // plain text body
    html: html
  } );


  const m = `Message sent: %s${info.messageId}`;

  logExpel( m );
  console.log( m );
}


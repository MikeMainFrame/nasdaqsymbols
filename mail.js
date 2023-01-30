

exports.mail = async function ( subject, html, pass, who ) {

  "use strict";

  async function viaGMail() {

    const nodemailer = require( "nodemailer" );
    const logExpel = require( './logExpel.js' );

    let transporter = nodemailer.createTransport( {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // c u c t x n u e o v t e q v v z
      auth: {
        user: 'miketriticum@gmail.com',
        pass: 'wxrioeurqoqnlvlr'
      },//wxrioeurqoqnlvlr

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
  async function viaSendGridMail() {

    const axios = require( "axios" );
    const data = {
      data: {
        "personalizations": [ {
          "to": [ { "email": "john@example.com" } ],
          "subject": "Hello, World!"
        } ],
        "from": { "email": "from_address@example.com" },
        "content": [ { "type": "text/plain",
         "value": "Hello, World!"
         } ]
      }
    }

    const mailReply = await axios.post( 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send', {
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': process.env.YAHOO,
        'X-RapidAPI-Host': 'rapidprod-sendgrid-v1.p.rapidapi.com'
      }, data
    } );

    console.log( JSON.stringify( mailReply, null, 2 ) )

  }
  viaSendGridMail()
  //viaGMail()
  return;
}

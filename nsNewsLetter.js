

exports.newsLetter = async ( I, O ) => {

  const axios = require( 'axios' ).default;

  const { Storage } = require( '@google-cloud/storage' );
  const storage = new Storage();
  const timestamp = require( './timestamp.js' );
  const row = require( './row.js' );
  const cell = require( './cell.js' );
  const sheet = require( './sheet.js' );

  console.log('a0')
  let symbols = JSON.parse( await getFileContent( 'CMS/nsSymbolsList.json' ) );

  HTML = row(
    cell( "Symbol" )
    + cell( "Currency" )
    + cell( "Close" )
    + cell( "Open" )
    + cell( "Price " )
    + cell( "HIGH" )
    + cell( "low" )
    + cell( "Volume " )
    + cell( "Post Time" )
    + cell( "Post Price" )
    + cell( "Post Change" )
    + cell( "Pre Time" )
    + cell( "Pre Price" )
    + cell( "Pre Change" )
    + cell( "Deadline " )
  )


  let promises = symbols.map( async ( slot ) => {

    const rapidapi = await axios.get( 'https://yh-finance.p.rapidapi.com/stock/v2/get-financials', {
      params: {
        symbol: slot.symbol,
        region: 'US',
      },
      headers: {
        'x-rapidapi-key': process.env.YAHOO,
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
      }
    } )

    return rapidapi.data.price
  } )

  const finalData = await Promise.all( promises )

  finalData.map( ( elm ) => { HTML += keyAndValue( elm ) } )

  dispatchMail( sheet( HTML ) )

  async function dispatchMail( HTML ) {

    savePersistent( HTML );
  
    let N, L;

    //N = await getFileContent( "CMS/nsNewsLetter.HTML" );
    L = JSON.parse( await getFileContent( "CMS/nsDistribution.json" ) )
    
    if ( L.length ) {
      const nodemailer = require( "nodemailer" );

      let transporter = nodemailer.createTransport( {
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'miketriticum@gmail.com',
          pass: 'wxrioeurqoqnlvlr',
          //ixyp gmka yvfq khin
        },

      } );

      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });

      for ( let ix = 0; ix < L.length; ix++ ) {

        let who = `${L[ ix ].name} <${L[ ix ].mail}>`

        // send mail with defined transport object
        let info = await transporter.sendMail( {
          from: 'Michael Rasch <miketriticum@gmail.com>',
          to: who,
          subject: ' T R I 🦉 T I 🐺 C U M',
          html: HTML
        } );

        const m = `Message sent: %s${info.messageId}`;

        console.log( m );
      }

    }
  }


  async function getFileContent( what ) {

    const nasdaqTemplate = storage.bucket( 'nasdaqcomponents' ).file( what )

    let data = [];
    let aggregate = '';

    aggregate = nasdaqTemplate.createReadStream()
    aggregate.on( 'data', ( fragment ) => { data.push( fragment ) } )

    return new Promise( ( resolve, reject ) => {
      aggregate.on( 'end', () => { template = Buffer.concat( data ).toString( 'utf8' ); resolve( template ) } )
      aggregate.on( 'error', ( E ) => reject( E ) )
    } )
  }

  async function savePersistent( HTML ) {

    const F = storage.bucket( 'nasdaqprices' ).file( `s${timestamp()}.HTML` );
    await F.save( HTML )

  }

  function keyAndValue( sub ) {

    return row(
      cell( sub.symbol )
      + cell( sub.currencySymbol )
      + cell( sub.regularMarketPreviousClose.fmt )
      + cell( sub.regularMarketOpen.fmt )
      + cell( sub.regularMarketPrice.fmt )
      + cell( sub.regularMarketDayHigh.fmt )
      + cell( sub.regularMarketDayLow.fmt )
      + cell( sub.regularMarketVolume.longFmt )
      + cell( new Date( sub?.postMarketTime * 1e3 ).toTimeString().substring( 0, 5 ) )
      + cell( sub?.postMarketPrice.fmt )
      + cell( sub?.postMarketChange.fmt )
      + cell( new Date( sub?.preMarketTime * 1e3 ).toTimeString().substring( 0, 5 ) )
      + cell( sub?.preMarketPrice.fmt )
      + cell( sub?.preMarketChange.fmt )
      + cell( timestamp( sub.regularMarketTime * 1e3 ) )
    )
  }
}

exports.newsLetter = async ( I, O ) => {

  const axios = require( 'axios' ).default;
  const sgMail = require( '@sendgrid/mail' );
  const { Storage } = require( '@google-cloud/storage' );
  const storage = new Storage();
  const timestamp = require( './timestamp.js' )


  let html = trWrap(
    thWrap( "Symbol" )
    + thWrap( "Currency" )
    + thWrap( "Close" )
    + thWrap( "Open" )
    + thWrap( "Price " )
    + thWrap( "HIGH" )
    + thWrap( "low" )
    + thWrap( "Volume " )
    + thWrap( "Post Time" )
    + thWrap( "Post Price" )
    + thWrap( "Post Change" )
    + thWrap( "Pre Time" )
    + thWrap( "Pre Price" )
    + thWrap( "Pre Change" )
    + thWrap( "Deadline " )
  )

  let symbols = JSON.parse( await getFileContent( 'CMS/nsSymbolsList.json' ) )
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

  finalData.map( ( elm ) => { html += keyAndValue( elm ) } )

  dispatchMail( tableWrap( html ) )

  async function dispatchMail( html ) {

    let N, L;

    N = await getFileContent( "CMS/nsNewsLetter.html" );
    L = JSON.parse( await getFileContent( "CMS/nsDistribution.json" ) )

    sgMail.setApiKey( process.env.SENDGRID_API_KEY );

    for ( let ix = 0; ix < L.length; ix++ ) {
      const msg = {
        to:
        {
          email: L[ ix ].mail,
          name: L[ ix ].name
        },
        from: "triticumarchives@hansolo.appspotmail.com",
        subject: "N A S D A Q   🐻   S T O C K   🐮   E X C H A N G E ",
        text: "raw",
        html: html
      }
      await sgMail.send( msg )
    }
    savePersistent( html );
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

  async function savePersistent( html ) {

    const F = storage.bucket( 'nasdaqprices' ).file( `s${timestamp()}.html` );
    await F.save( html )

  }

  function keyAndValue( sub ) {

    return trWrap(
      tdWrap( sub.symbol )
      + tdWrap( sub.currencySymbol )
      + tdWrap( sub.regularMarketPreviousClose.fmt )
      + tdWrap( sub.regularMarketOpen.fmt )
      + tdWrap( sub.regularMarketPrice.fmt )
      + tdWrap( sub.regularMarketDayHigh.fmt )
      + tdWrap( sub.regularMarketDayLow.fmt )
      + tdWrap( sub.regularMarketVolume.longFmt )
      + tdWrap( new Date( sub?.postMarketTime * 1e3 ).toTimeString().substring( 0, 5 ) )
      + tdWrap( sub?.postMarketPrice.fmt )
      + tdWrap( sub?.postMarketChange.fmt )
      + tdWrap( new Date( sub?.preMarketTime * 1e3 ).toTimeString().substring( 0, 5 ) )
      + tdWrap( sub?.preMarketPrice.fmt )
      + tdWrap( sub?.preMarketChange.fmt )
      + tdWrap( timestamp( sub.regularMarketTime ) )
    )
  }


  function tdWrap( text ) {
    return "<td style='border: solid; padding: .5em;text-align: center;' >" + text + '</td>'
  }

  function thWrap( text, noOfCols = 1 ) {
    return `<th style='text-align: center; padding: .5em' colspan=${noOfCols} > ${text}</th>`
  }

  function trWrap( text ) {
    return "<tr>" + text + '</tr>'
  }

  function tableWrap( str ) {
    return "<table style='border-collapse:collapse'>" + str + "</table>"
  }
}
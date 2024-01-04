'use strict'
const express = require( 'express' )
const A = express()
const axios = require( 'axios' ).default
const { Storage } = require( '@google-cloud/storage' )
const timestamp = require( './timestamp.js' );
const row = require( './row.js' );
const candleStickChart = require( './candleStickChart.js' );
const sheet = require( './sheet.js' );
const cell = require( './cell.js' );
const inline = require( './inline.js' );
const block = require( './block.js' );
const saxoFiles = require( './saxoFiles.js' );
const keyData = require( './nsNewsLetter.js' );
const { link } = require( 'fs' )


let html = 'Ø'

// is this in github ?

A.use( express.json() )

A.use( '/', express.static( 'public', { index: 'nsMain.html', } ) )

A.listen( process.env.PORT || 3000, () => {
  console.log( 'all good 🚀 Press Ctrl+C to quit.' )
} )

A.get( '/yahoo/tsv/files', async ( request, response ) => {

  let HTML = [];
  let rows = [];

  let all = await listSaxoFiles();

  for ( let jx = 0; jx < all.length; jx++ ) { rows.push( saxoFiles( all[ jx ], jx ) ) }

  HTML.push( CSS )
  HTML.push( '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;500&display=swap" rel="stylesheet"></link>' )

  response.type( 'html' );
  response.send( HTML.join( '' ) + sheet( rows.join( '' ) ) );

  async function listSaxoFiles() {
    const storage = new Storage()
    const [ files ] = await storage.bucket( 'nasdaqprices' ).getFiles( { prefix: 'saxo' } )
    return files;
  }

} )


A.get( '/yahoo/tsv/transactions/:name', async ( request, response ) => {

  let csv_file = await getFile( request.params.name );
  let raw = csv_file.split( '\x0D\x0A' );
  let names = raw.shift().split( '\x09' )
  let sumit = 0;
  let temp = 0;
  let HTML = [];

  let csv_data = raw.sort(
    ( a, b ) => {
      let current = a.split( '\x09' )[ 2 ]
      let previous = b.split( '\x09' )[ 2 ]
      if ( current > previous ) return 1
      if ( current < previous ) return -1
      return 0
    }
  )

  let old = 'ø'
  let rows = cell(
    block( inline( csv_data[ 0 ].split( '\x09' )[ 2 ], 'ns-name' ) ) )

  for ( let jx = 0; jx < csv_data.length; jx++ ) {
    let line = csv_data[ jx ].split( '\x09' )

    if ( line[ 12 ].charCodeAt( 0 ) === 45 && line[ 12 ].length === 1 ) continue;
    if ( old === 'ø' ) old = line[ 2 ]
    if ( old === line[ 2 ] === false && jx > 0 ) {
      rows = rows
        + cell(
          block( inline( amount( sumit ), 'ns-sum' ) )
          + block( inline( '#summa', 'ns-date' ) ) )
      HTML.push( row( rows ) )
      sumit = 0;
      old = line[ 2 ]
      rows = cell(
        block( inline( line[ 2 ], 'ns-name' ) ) )
    }

    rows = rows
      + cell(
        block( inline( amount( line[ 12 ] ), 'ns-999' ) )
        + block( inline( line[ 0 ], 'ns-date' ) ) )

    temp = parseInt( line[ 12 ] )
    sumit = sumit + temp
  }

  HTML.push( CSS )
  HTML.push( '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;400;700&family=IBM+Plex+Sans&display=swap" rel="stylesheet"></link>' )
  response.type( 'html' );
  response.send( sheet( HTML.join( '' ) ) );

} )

A.get( '/yahoo/tsv/:name', async ( request, response ) => {

  let csv_file = await getFile( request.params.name );
  let HTML = [], rows = [], cells = []
  let raw = csv_file.split( '\x0D\x0A' )
  let names = raw.shift() // copy headline and remove it from sort
  let line = "";
  let wCSS = "";
  let no = request.query.no;


  let csv_data = raw.sort(
    ( a, b ) => {
      let current = a.split( '\x09' )[ no ]
      let previous = b.split( '\x09' )[ no ]
      if ( current > previous ) return 1
      if ( current < previous ) return -1
      return 0
    }
  )

  csv_data.unshift( names ) // reenter headline at beginning

  for ( let ix = 0; ix < csv_data.length; ix++ ) {
    line = csv_data[ ix ].split( '\x09' );
    ( ix === 0 ) ? wCSS = 'ns-heading' : wCSS = 'ns-text'
    for ( let jx = 0; jx < line.length; jx++ ) {
      cells.push( cell( inline( line[ jx ], wCSS ) ) )
    }
    rows.push( row( cells.join( '' ) ) )
    cells = []
  }

  HTML.push( sheet( rows.join( '' ) ) )
  HTML.push( CSS );

  HTML.push( '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;700&family=IBM+Plex+Sans&display=swap" rel="stylesheet"></link>' )

  response.type( 'html' );
  response.send( HTML.join( '' ) );
} )

A.get( '/yahoo/summary/code/:code', async ( request, response ) => {

  const nasdaq = await axios.get( 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary', {
    params: {
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    },
  } )

  var specs = {}

  specs.longName = nasdaq.data.price[ 'longName' ]
  specs.longBusinessSummary = nasdaq.data.summaryProfile[ 'longBusinessSummary' ].split( '.' ).join( '.<br>' )
  specs.fullTimeEmployees = nasdaq.data.summaryProfile[ 'fullTimeEmployees' ]
  specs.address1 = nasdaq.data.summaryProfile[ 'address1' ]
  specs.currency = nasdaq.data.earnings[ 'financialCurrency' ]
  specs.city = nasdaq.data.summaryProfile[ 'city' ]
  specs.zip = nasdaq.data.summaryProfile[ 'zip' ]
  specs.state = nasdaq.data.summaryProfile[ 'state' ]
  specs.country = nasdaq.data.summaryProfile[ 'country' ]
  specs.industry = nasdaq.data.summaryProfile[ 'industry' ]
  specs.sector = nasdaq.data.summaryProfile[ 'sector' ]
  specs.mCap = nasdaq.data.summaryDetail[ 'marketCap' ].longFmt
  specs.ebitda = nasdaq.data.financialData[ 'ebitdaMargins' ].fmt

  response.type( 'json' )
  response.send( JSON.stringify( specs, null, 2 ) )
} )


A.get( '/yahoo/financial/code/:code', async ( request, response ) => {

  const nasdaq = await axios.get( 'https://yh-finance.p.rapidapi.com/stock/v2/get-financials', {
    params: {
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    }
  } )


  response.type( 'html' )
  response.send( keyData( nasdaq.data.price ) )

} )


A.get( '/yahoo/chart/code/:code', async ( request, response ) => {

  const nasdaq = await axios.get( 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart', {
    params: {
      interval: '5m',
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    },
  } )

  // putNASDAQ( nasdaq.data, nasdaq.data.chart.result[ 0 ].meta )

  let collection = []

  nasdaq.data.chart.result[ 0 ].timestamp.map( ( T, ix ) => {
    var slot = {}
    slot.timestamp = T
    slot.dateISO = new Date( slot.timestamp * 1e3 ).toISOString()
    slot.close = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].close[ ix ]
    slot.volume = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].volume[ ix ]
    slot.low = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].low[ ix ]
    slot.high = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].high[ ix ]
    slot.open = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].open[ ix ]

    collection.push( slot )
  } )


  response.type( 'html' )
  response.send( candleStickChart( collection ) )
} )

A.get( '/yahoo/chart/history/local/code/:code', async ( request, response ) => {
  let rows = [];
  let HTML = [];
  const storage = new Storage()
  const [ files ] = await storage.bucket( 'nasdaqprices' ).getFiles( { prefix: 'symbols/' + request.params.code } )

  files.forEach( ( fileObject, ix ) => { rows.push( saxoFiles( fileObject, ix ) ) } )

  HTML.push( sheet( rows.join( '' ) ) )
  HTML.push( CSS )
  HTML.push( '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;500&display=swap" rel="stylesheet"></link>' )

  response.type( 'html' )
  response.send( HTML.join( '' ) )

} )

A.get( '/yahoo/chart/history/code/:code', async ( request, response ) => {
  let twoDataset = {};
  let nasdaq = await axios.get(
    'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-chart',
    {
      params: {
        interval: '5m',
        symbol: request.params.code,
        period1: request.query.p1,
        period2: request.query.p2,
        includePrePost: 'false',
        useYfid: 'true',
        includeAdjustedClose: 'true',
        events: 'capitalGain,div,split',
      },
      headers: {
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.YAHOO,
      },
    }
  )

  let collection = []

  nasdaq.data.chart.result[ 0 ].timestamp.map( ( T, ix ) => {
    let slot = {}
    slot.timestamp = T
    slot.dateISO = new Date( slot.timestamp * 1e3 ).toISOString()
    slot.close = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].close[ ix ]
    slot.volume = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].volume[ ix ]
    slot.low = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].low[ ix ]
    slot.high = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].high[ ix ]
    slot.open = nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].open[ ix ]

    collection.push( slot )
  } )

  twoDataset.prices = collection;

  nasdaq = await axios.get( 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary', {
    params: {
      symbol: request.params.code,
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    },
  } )

  twoDataset.summary = nasdaq.data;

  response.type( 'json' );
  response.send( JSON.stringify( twoDataset, null, 2 ) )
  //putNASDAQ( nasdaq.data, request.params.code );

} )


A.get( '/yahoo/newsletter/code/:code', async ( request, response ) => {
  const { newsLetter } = require( './nsNewsLetter.js' );
  if ( request.params.code === 'owlwolf' ) newsLetter();
} )


async function getFile( what ) {


  const storage = new Storage()
  const nasdaqTemplate = storage.bucket( 'nasdaqprices' ).file( 'saxo/' + what )

  let data = [];
  let aggregate = '';
  let template = '';

  aggregate = nasdaqTemplate.createReadStream()
  aggregate.on( 'data', ( fragment ) => { data.push( fragment ) } )

  return new Promise( ( resolve, reject ) => {
    aggregate.on( 'end', () => { template = Buffer.concat( data ).toString( 'utf8' ); resolve( template ) } )
    aggregate.on( 'error', ( E ) => reject( E ) )
  } )

}

async function getFlag( name ) {

  let raw = await getTemplate( 'countries.tsv' );
  let tsv_file_countries = raw.split( '\x0D\x0A' );
  let temp = "";


  for ( let jx = 0; jx < tsv_file_countries.length; jx++ ) {
    temp = tsv_file_countries[ jx ].split( '\x09' );
    if ( temp[ 2 ] === name ) return temp[ 0 ].toLocaleLowerCase()
  }
  return 'Ø'
}
async function getTemplate( what ) {


  const storage = new Storage()
  const nasdaqTemplate = storage.bucket( 'nasdaqcomponents' ).file( what )

  let data = [];
  let aggregate = '';
  let template = '';

  aggregate = nasdaqTemplate.createReadStream()
  aggregate.on( 'data', ( fragment ) => { data.push( fragment ) } )

  return new Promise( ( resolve, reject ) => {
    aggregate.on( 'end', () => { template = Buffer.concat( data ).toString( 'utf8' ); resolve( template ) } )
    aggregate.on( 'error', ( E ) => reject( E ) )
  } )

}

function putNASDAQ( data, symbol ) {
  let fileName = "_" + timestamp()
  const storage = new Storage()
  const F = storage.bucket( 'nasdaqprices' ).file( `symbols/${symbol}.${fileName}.json` );
  F.save( JSON.stringify( data ), function ( E ) { if ( E ) console.log( E ) } )
}

function amount( str ) {
  let temp = parseInt( str )
  if ( isNaN( temp ) ) return 0
  return temp.toLocaleString( "de" )
}

var CSS = `<style> 

body {margin:0;
  padding:0}
  
table {  
  font-family: 'Fira Sans', sans-serif;
  font-size: 13px;  
  font-weight: 300;  
  width: 100%;
  border-collapse: collapse;
  background: #111;
  background-image: linear-gradient(#000000a0, #000000a0),
    url(https://storage.googleapis.com/nasdaqcomponents/NY_stock_exchange_traders_floor_LC-U9-10548-6.jpg);
  background-attachment: fixed;
  background-size: cover;
  object-fit: contain;
  color: #fff;
}
*.ns-block {
  display: block;
}
*.ns-img {
  width: 30px
}
*.ns-nowrap {
  white-space: nowrap
}
*.ns-pre {
  display: block;
  unicode-bidi: embed;
  font-family: monospace;
  white-space: pre;
  font-size: 80%
}
td,
th {
  padding: .5em;  
  
  vertical-align: top;
}

th {
  text-align:left;
  font-weight: 500;  
  white-space: nowrap;
  background: #ffffff40;
}

*.ns-name {
  text-align: left;
  font-size: 30px;  
  font-weight: 500;  
}
*.ns-key {
  font-weight: 500;
  text-align: right;

}
 *.ns-sum {
   font-weight: 500;  
   color: #fff;
   
  text-align: right;
 }
*.ns-999 {
  text-align: right;
}
*.ns-heading {
  font-weight: 700;
  text-align: center;
} 
*.ns-date {
  font-weight: 100;
}
*.ns-text {
  font-size: 13px;
  line-height: 160%;  
  font-weight: 100;
}
*.w49 {
  width: 49%;
  float:left
}
tr {
  border-bottom: solid .5px #888;
}
.columns-5 {
  columns: 5 auto;
  color: #fff;
  margin: 0;
  line-height: 160%;
} </style>`
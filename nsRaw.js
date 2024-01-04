'use strict'
const { Storage } = require( '@google-cloud/storage' )
const sheet = require( './sheet.js' );
const saxofileObjects = require( './saxoFiles.js' );
const https = require( 'http' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );

const stream = require( 'node:stream' )

const url = require( 'url' );
const { exit } = require( 'process' );


https.createServer().on( 'request', processRequest ).listen( 3000 );

async function processRequest( request, response ) {

  let pileUp = [];

  response.statusCode = 200; // default PAGE FOUND - must be matured ...

  request.on( 'data', dataArrive )
  request.on( 'error', exitProcess )
  request.on( 'end', executeRequest )

  async function executeRequest() {


    const { method, url } = request;
    const url1 = url.split( '/' )[ 1 ]
    const fileName = path.join( __dirname, url1 )
    console.log( url1 )
    response.on( 'error', exitProcess );

    response.writeHead( 200, 'Content-Type', 'text/html; charset=utf-8' );
    fs.createReadStream( fileName ).pipe( response );
    //response.end();
    /*
          fs.readFile( fileName, 'utf8', ( err, data ) => {
          if ( err ) {
            response.statusCode = 404;
            if ( url === '/yahoo/tsv/files' ) {
              doFiles();
            }
          } else {
            
            //response.write( data.toString() );
            console.log( 'found file: ' + fileName );
          }
          response.end();
          //doFiles();
        } );
        */

    async function doFiles() {

      let prefix = url.split( "/" )[ 4 ];
      let HTML = [];
      let rows = [];


      const storage = new Storage()
      const [ fileObjects ] = await storage.bucket( 'nasdaqprices' ).getFiles( { prefix: 'saxo/T' } )

      let body = Buffer.concat( pileUp ).toString();

      for ( let jx = 0; jx < fileObjects.length; jx++ ) { rows.push( saxofileObjects( fileObjects[ jx ], jx ) ) }

      HTML = index_html.split( '##' )
      response.setHeader( 'Content-Type', 'text/html; charset=utf-8' );
      response.write( HTML[ 0 ] + rows.join( '' ) + HTML[ 1 ] );
      response.statusCode = 200;
      return;

    }
  }

  function dataArrive( streamBytes ) {
    pileUp.push( streamBytes )
    console.log( Buffer.concat( pileUp ).toString() )
  }

  function exitProcess( what ) {
    console.log( '--exitProcess--' )
    console.error( what.stack )
    process.exit( 1 )
  }
}

var index_html = `
<html>
  <head>
    <meta charset="utf-8">
    <title> T R I 🦉 T I 🐺 C U M</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@100;300;500&display=swap"      rel="stylesheet">
    <link href="https://storage.googleapis.com/nasdaqcomponents/ns.svg"      rel="icon">
  </head>
  <body id="zmain">
  ##
  </body>
  <script src="xmlPost.js" defer></script>
</html>`


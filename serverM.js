'use strict'

const { PubSub } = require( '@google-cloud/pubsub' );
const { Storage } = require( '@google-cloud/storage' )
const timestamp = require( './timestamp.js' );

const path = require( 'path' );
const http = require( 'http' );
const fs = require( 'fs' );
const { versions } = require( 'process' );
const PORT = 8000;

const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};

const STATIC_PATH = path.join( process.cwd(), './public' );

const toBool = [ () => true, () => false ];

const prepareFile = async ( url ) => {
  const paths = [ STATIC_PATH, url ];
  if ( url.endsWith( '/' ) ) paths.push( 'nsMain.html' );
  const filePath = path.join( ...paths );
  const pathTraversal = !filePath.startsWith( STATIC_PATH );
  const exists = await fs.promises.access( filePath ).then( ...toBool );
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + '/404.html';
  const ext = path.extname( streamPath ).substring( 1 ).toLowerCase();
  const stream = fs.createReadStream( streamPath );
  
  console.log( timestamp() + await anyMessages() )

  return { found, ext, stream };
};

http.createServer( async ( inp, out ) => {
  const file = await prepareFile( inp.url );
  const statusCode = file.found ? 200 : 404;
  const mimeType = MIME_TYPES[ file.ext ] || MIME_TYPES.default;

  out.writeHead( statusCode, { 'Content-Type': mimeType } );
  file.stream.pipe( out );

  console.log( `${timestamp()} ${inp.method} ${inp.url} ${statusCode}` );
} ).listen( PORT );

console.log( `${timestamp()} Server running at http://127.0.0.1:${PORT}/` );
console.log( ` ${timestamp()}vNode JS spec: ${JSON.stringify( versions, null, 2 )}` )

async function anyMessages() {
  const pubSubClient = new PubSub();
  const subscription = pubSubClient.subscription( 'projects/nasdaqsymbols/subscriptions/server-activity-sub' );

  return new Promise( ( resolve, reject ) => {
    subscription.on( 'message', ( message ) => {
      message.ack()
      resolve(  message.data.toString()  )
    } );
  } )
}
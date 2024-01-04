module.exports = async function logExpel( what ) {

  const { PubSub } = require( '@google-cloud/pubsub' );
  

  async function expel( what ) {

    const pubSubClient = new PubSub();
    const dataBuffer = Buffer.from( what );

    try {
      const messageId = await pubSubClient
        .topic( 'server-activity' )
        .publishMessage( { data: dataBuffer } );
      return messageId;
      
    } catch ( error ) {
      console.error( `Received error while publishing: ${error.message}` );
      process.exitCode = 1;
    }
  }
  
  expel( what )
}
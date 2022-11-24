/******
 *  #2 topic - projects/nasdaqsymbols/subscriptions/server-activity
 */
const timestamp = require( './timestamp.js' )

listenForMessages();
return ( 1 )

function listenForMessages() {
  const { PubSub } = require( '@google-cloud/pubsub' );
  const timeout = 20;
  const pubSubClient = new PubSub();
  const subscription = pubSubClient.subscription( 'projects/nasdaqsymbols/subscriptions/server-activity-water-tap' );

  // Create an event handler to handle messages
  let messageCount = 0;
  const messageHandler = message => {
    console.log( ` at ${timestamp()} we received message ${message.id}:` );
    console.log( `\tData: ${message.data}` );
    messageCount += 1;
    message.ack();
  };

  subscription.on( 'message', messageHandler );

  setTimeout( () => {
    subscription.removeListener( 'message', messageHandler );
    console.log( `${messageCount} message(s) received.` );
  }, timeout * 1000 );
}

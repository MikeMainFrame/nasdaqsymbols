// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
const topicNameOrId = 'projects/nasdaqsymbols/topics/todo'
// Creates a client; cache this for further use
const pubSubClient = new PubSub();

async function listAllTopics() {
  // Lists all topics in the current project
  const [topics] = await pubSubClient.getTopics();
  console.log('Topics:');
  topics.forEach(topic => console.log(topic.name));
  createTopic()
}

listAllTopics().catch(console.error);



async function createTopic() {
  // Creates a new topic
  await pubSubClient.createTopic(topicNameOrId);
  console.log(`Topic ${topicNameOrId} created.`);
}

createTopic();
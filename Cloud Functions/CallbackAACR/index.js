
const dialogflow = require('@google-cloud/dialogflow');
const projectId = "gcp";
const location = "us-east1";
const LANGUAGE_CODE = 'en-US';
const eventName = 'ResponseEvent'; 
const keypath = "key.json";
const triggerCallback = (sessionId, message) => {
	var sessionClient = new dialogflow.SessionsClient({projectId: projectId, keyFilename: keypath});
	return Promise.resolve(() => {
	  return sessionClient.initialize();
	}).then( () => {
	  return sessionClient.projectAgentSessionPath(projectId,sessionId);
	}).then( (sessionPath) => {
	  console.log("sessionPath",sessionPath);
	  const request = {
		session: sessionPath,
		queryInput: {
		  event: {
		    name: eventName,  
		    languageCode: LANGUAGE_CODE
		  },
		},
	  };
	  
	  return sessionClient.detectIntent(request);
	}).then( response => {
	  console.log('intent detected');
	  const result = response[0].queryResult;
	  console.log(`Query: ${result.queryText}`);
	  console.log(`Response: ${result.fulfillmentText}`);

	  if(result.fulfillmentText) {
		console.log("fulfillmentText", result.fulfillmentText);
		return result.fulfillmentText;
	  }
	  else {
		console.log('no intent found');
	  }
	});
};
  

exports.CallbackAACR = (req, res) => {
  let sessionId = req.query.sessionId || req.body.sessionId || '';
  let message = req.query.message || req.body.message || 'Hello World!';
  triggerCallback(sessionId, message)
  .then((response)=>{
    res.status(200).send(response);
  }).catch(error => {
    console.error('Trigger bot error! ', JSON.stringify(error));
    res.status(400).send(error.message);
  });
};

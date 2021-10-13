
const endpoint = "https://us-central1-gcp.cloudfunctions.net/";
const callAPI = (token, url, fileId, runAsUserIds, parameters, returns) => {
  const axios = require('axios').default;
  const paramConverted = {};
  for (const property in parameters) {
    paramConverted[property] = {
      "string": parameters[property]
    }
  }
  const post_data = {
    "fileId": fileId,
    "runAsUserIds": [runAsUserIds],
    "botInput": paramConverted,
    "callbackInfo": {
      "url": endpoint+"WriteCallbackAACR",
      "headers": {
        "sessionId": "DefaultSessionID",
        "returns": returns
      }
    }
  };
  const headers = { 
    'X-Authorization': token,
    'Content-Type': 'application/json'
  };
  console.log("Post data are: "+JSON.stringify(post_data));
  console.log("Headers are: "+JSON.stringify(headers));
  console.log("URL is: "+url+'v3/automations/deploy');
  return axios.post(url+'v3/automations/deploy', post_data, {headers: headers})
    .then(response => {
      console.log("Trigger response status: ", JSON.stringify(response.status));
      console.log("Trigger response data: ", JSON.stringify(response.data));
      const deploymentId = response.data.deploymentId;
      return deploymentId;
    });
};
exports.TriggerBotAACR = (req, res) => {
  let token = req.query.token || req.body.token || '';
  let returns = req.query.returns || req.body.returns || '';
  let url = req.query.url || req.body.url || '';
  let fileId = req.query.fileId || req.body.fileId || '';
  let runAsUserIds = req.query.runAsUserIds || req.body.runAsUserIds || '';
  let parameters = req.query.parameters || req.body.parameters || '';
  if (typeof parameters === 'string' || parameters instanceof String){
    parameters = JSON.parse(parameters);
  }
  console.log("Token is: "+token);
  console.log("FileId is: "+fileId);
  console.log("RunAsUserIds is: "+runAsUserIds);
  console.log("URL is: "+url);
  console.log("Parameters are: "+JSON.stringify(parameters));
  return callAPI(token, url, fileId, runAsUserIds,parameters, returns)
  .then((results)=>{
    res.status(200).send(results);
  }).catch(error => {
      console.error('Trigger bot error! ', JSON.stringify(error));
      res.status(400).send(error.message);
    });
};

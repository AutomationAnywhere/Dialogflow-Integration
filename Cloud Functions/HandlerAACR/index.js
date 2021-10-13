
const axios = require('axios').default;
const endpoint = "https://us-central1-gcp.cloudfunctions.net/";


function TriggerBot(session, parameters) {
  const sessionAry = session.split("/");
  const color = parameters.color;
  const size = parameters.size;
  const region = parameters.region;
  const sessionId = sessionAry[7];
  const agentId = sessionAry[5];
  const locId = sessionAry[3];
  const proId = sessionAry[1];
  let loginToken = '';
  let botId = "";
  let runnerId = "";
  let url = "";
  let returns= "";
  console.log("Ready to trigger config parser: ", endpoint+'ConfigParserAACR');
  return axios.get(endpoint+'ConfigParserAACR')
  .then(response => {
    console.log("Config parser called: "+JSON.stringify(response.data));
    url = response.data["aa-cr"].url;
    runnerId = response.data["aa-cr"].runAsUserId;
    botId = response.data["aa-cr"].botId;
    returns = response.data["aa-cr"].returns;
    console.log("Ready to trigger Authen");
    return axios.get(endpoint+'AuthenticateAACR')
  }).then(response => {
    loginToken = response.data;
    console.log("Authentication called: "+loginToken);
    let params = {
    token: loginToken, 
    fileId: botId,
    runAsUserIds: runnerId, 
    url: url,
    returns: returns,
    parameters: {
        color: color,
        size: size,
        region: region,
        agentId: agentId,
        locationId: locId,
        projectId: proId,
        sessionId: sessionId
      }
    };
    console.log("Calling TribberBotAACR with these inputs: "+JSON.stringify(params));
    return axios.get(endpoint+'TriggerBotAACR', { params });
  }).then(()=>{
    console.log("Trigger Bot AACR finished.");
    return 'Bot triggered successfully';
  });
}


exports.HandlerAACR = (req, res) => {
  console.log("start");
  console.log("req sessionInfo session", JSON.stringify(req.body.sessionInfo.session));
  console.log("req sessionInfo parameters", JSON.stringify(req.body.sessionInfo.parameters));
  console.log("req pageInfo currentPage", JSON.stringify(req.body.pageInfo.currentPage));

  return TriggerBot(req.body.sessionInfo.session, req.body.sessionInfo.parameters)
  .then((message)=>{
    let returnResponse = {
      "fulfillmentResponse": {
        "messages": [{"text": {
          "text": [message]
        }}]
      },
      "sessionInfo": {
        "parameters": {
            "response_code": "200"
        }
      }
    }
    console.log("return response", JSON.stringify(returnResponse));
    res.status(200).send(returnResponse);
  })
  .catch(error=>{
    console.log("Cloud function error: ", JSON.stringify(error));
    res.status(400);
  });
};

const endpoint = "https://us-central1-gcp.cloudfunctions.net/";
const axios = require('axios').default;
exports.WriteCallbackAACR = (req, res) => {
  let sessionId = req.get('sessionId') || req.query.sessionId || req.body.sessionId || 'DefaultSessionID';
  let returns = req.get('returns') || req.query.returns || req.body.returns || '';
  console.log("sessionId ",sessionId);
  console.log("returns ",returns);
  console.log("botOutput ", JSON.stringify(req.body.botOutput));
  returns = returns.split(",");
  let values = {};
  for (const r of returns){
    if(r in req.body.botOutput){
      console.log("parsing "+r+", value "+req.body.botOutput[r].string);
      values[r] = req.body.botOutput[r].string;
    }else{
      console.log("parsing "+r+", no value found ");
    }
  }
  values = encodeURI(JSON.stringify(values));
  console.log("value encoded ", values);
  console.log("DialogFlowBotCallback triggered");
  console.log("Session Id: ", sessionId);
  return axios.get(endpoint+'TempStorage?action=write&key='+sessionId+'&value='+values)
  .then(content => {
    res.status(200).send("OK");
  });
};

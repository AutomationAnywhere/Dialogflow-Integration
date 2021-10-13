const endpoint = "https://us-central1-gcp.cloudfunctions.net/";
const axios = require('axios').default;
exports.ReadCallbackAACR = (req, res) => {
  let sessionParameters = req.body.sessionInfo.parameters;
  let session = req.body.sessionInfo.session;
  const storageKey = "DefaultSessionID";
  console.log("session Parameter", JSON.stringify(sessionParameters));
  console.log("call url: ", endpoint+'TempStorageAACR?action=read&key='+storageKey);
  return axios.get(endpoint+'TempStorageAACR?action=read&key='+storageKey)
  .then(value=>{
    console.log("Read storage data", value.data);
    let returnResponse = {
      "session_info":{
          "session": session,
          "parameters": value.data
      }
    };
    
    console.log("response data: " + JSON.stringify(returnResponse));
    res.status(200).send(returnResponse);
  }).catch(e=>{
    console.log("400 on get value from storage: ", e.message);
    res.status(400);
  });
};


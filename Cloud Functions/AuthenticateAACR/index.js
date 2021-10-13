const axios = require('axios').default;
const endpoint = "https://us-central1-gcp.cloudfunctions.net/";
const callAPI = () => {
  var url = "";
  const post_data = {
    "username": "",
    "password": ""
  };
  return axios.get(endpoint+'ConfigParserAACR')
  .then(response => {
    console.log("ConfigParserAACR response", response.data);
    post_data.username = response.data["aa-cr"].username;
    post_data.password = response.data["aa-cr"].password;
    url = response.data["aa-cr"].url;

    return axios.post(url+'v1/authentication', post_data);
  })
  .then(response => {
    console.log("Authen response status: ", JSON.stringify(response.status));
    console.log("Authen response data: ", JSON.stringify(response.data));
    const token = response.data.token;
    return token;
  }).catch(error => {
    console.error('There was an error! ', JSON.stringify(error));
    return "error";
  });
};

exports.AuthenticateAACR = (req, res) => {
  return callAPI().then((results)=>{
    res.status(200).send(results);
  });
};

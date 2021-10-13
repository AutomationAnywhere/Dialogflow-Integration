const keypath = "key.json";
const storagePath = "TempStorage.json";
const projectId = "gcp";
const bucketName = "test-bucket-aa";
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({projectId: projectId, keyFilename: keypath});
const bucket = storage.bucket(bucketName);
const fileCache = {};
const readFromFile = async remoteFilePath => new Promise((resolve, reject) => {
  let buf = ''
  if (!(remoteFilePath in fileCache)){
    fileCache[remoteFilePath] = bucket.file(remoteFilePath);
  }
  fileCache[remoteFilePath]
    .createReadStream()
    .on('data', d => (buf += d))
    .on('end', () => resolve(buf))
    .on('error', e => {
      console.error("Read File Error", e);
      reject(e.message);
    });
});
const writeToFile = async (remoteFilePath, values) => new Promise((resolve, reject) => {
  console.log("Save to file: ", JSON.stringify(values));
  if (!(remoteFilePath in fileCache)){
    fileCache[remoteFilePath] = bucket.file(remoteFilePath);
  }
  fileCache[remoteFilePath]
  .save(JSON.stringify(values), function(err) {
	  if (!err) {
		  resolve();
	  }else{
		  reject("Temp File Failed to Save");
	  }
	});
});
exports.TempStorageAACR = (req, res) => {
  let action = req.get('action') || req.query.action || req.body.action || 'read';
  let key = req.get('key') || req.query.key || req.body.key || '';
  let value = req.get('value') || req.query.value || req.body.value || '';
  return readFromFile(storagePath)
  .then(content => {
    console.log("read result", content);
    console.log("action", action);
    console.log("key", key);
    var parsed = JSON.parse(content);
    if (key == ""){
      res.status(200).send(JSON.stringify(parsed));
      return;
    }
    if (action == "read"){
      if(key in parsed){
        console.log("value", parsed[key]);
        res.status(200).send(parsed[key]);
      }else{
        console.log("key not found");
        res.status(404).send("key not found: "+key);
      }
      return;
    }
    if(action == "write"){
        console.log("value", value);
      parsed[key] = value;
    }else if(action == "delete"){
      delete parsed[key];
    }
    writeToFile(storagePath, parsed)
    .then(() => {
      res.status(200).send("OK");
    })
    .catch(e => {
      console.log("Write error: ", JSON.stringify(e));
      res.status(400).send(e.message);
    });
  }).catch(e => {
      console.log("General error: ", JSON.stringify(e));
      res.status(400).send(e.message);
  });
};

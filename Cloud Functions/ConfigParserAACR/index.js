const projectId = "gcp";
const bucketName = "test-bucket-aa";
const configPath = "Config.yml";
const { Storage } = require('@google-cloud/storage');
const keyPath = "key.json"
const YAML = require('yaml');

const readConfig = async (projectId, bucketName, configPath, keyPath) => new Promise((resolve, reject) => {
  const storage = new Storage({projectId: projectId, keyFilename: keyPath});
  const bucket = storage.bucket(bucketName);
  let buf = ''
  console.log("Ready to read file");
  bucket.file(configPath)
    .createReadStream()
    .on('data', d => (buf += d))
    .on('end', () => resolve(buf))
    .on('error', e => {
      console.error("Read File Error", e);
      reject(e.message);
    });
});


exports.ConfigParserAACR = (req, res) => {
  console.log("Start");
  return readConfig(projectId, bucketName, configPath, keyPath)
  .then((results)=>{
    console.log("Read Config finished");
    const parsed = YAML.parse(results);
    res.status(200).send(JSON.stringify(parsed));
  })
  .catch((e)=>{
    console.log("Read error: ", e.message);
    res.status(400);
  });
};

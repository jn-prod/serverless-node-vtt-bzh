export default {
  baseUrl: process.env.CRON_START_URI,
  mongoUrl: process.env.MONGO_URL,
  s3: {
    accessKeyId: process.env.KEY, // replace with your access key
    secretAccessKey: process.env.SECRET, // replace with your secret   key
  },
};

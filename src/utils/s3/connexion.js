import AWS from 'aws-sdk';
import config from '../../config/default';

export default new AWS.S3({
  accessKeyId: config.s3.accessKeyId,
  secretAccessKey: config.s3.secretAccessKey,
});

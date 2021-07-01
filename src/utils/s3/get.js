import assert from 'assert';
import getBucketName from './service';
import s3 from './connexion';

export default async function get({ kind }) {
  try {
    assert.ok(kind, '[get] - missing kind param');
    const bucket = getBucketName(kind);
    assert.ok(bucket, '[get] - missing bucket param');

    const params = {
      Bucket: bucket, // replace with your bucket name
      Key: `${kind}.json`, // File name which you want to put in s3 bucket
    };

    const result = await s3.getObject(params).promise();
    console.log(`Get file successfully from https:/${params.Bucket}.eu-west-3.amazonaws.com/${params.Key}`);
    return JSON.parse(result.Body.toString('utf-8'));
  } catch (error) {
    console.error(`[get] - error: ${error}`);
    throw error;
  }
}

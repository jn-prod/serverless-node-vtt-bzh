import assert from 'assert';
import s3 from './connexion';
import getBucketName from './service';

export default async function put({ data, kind }) {
  try {
    assert.ok(data, '[put] - missing body param');
    assert.ok(kind, '[put] - missing kind param');
    const bucket = getBucketName(kind);
    assert.ok(bucket, '[put] - missing bucket param');

    const params = {
      Bucket: bucket, // replace with your bucket name
      Key: `${kind}.json`, // File name which you want to put in s3 bucket
      Body: JSON.stringify(data), // '{ "message" : "Hello World!" }'; // file data you want to put
      ContentType: 'application/json',
    };

    const result = await s3.putObject(params).promise();
    console.log(`File uploaded successfully at https:/${params.Bucket}.eu-west-3.amazonaws.com/${params.Key}`);
    console.log(result);
  } catch (error) {
    console.error(`[put] - error: ${error}`);
    throw error;
  }
}

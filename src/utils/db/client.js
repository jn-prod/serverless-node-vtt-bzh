import assert from 'assert';
import config from '../../config/default';

const { MongoClient } = require('mongodb');

const getClient = () => MongoClient.connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const post = async (dbName, collection, data) => {
  assert.ok('[post] - Missing dbName params');
  assert.ok('[post] - Missing collection params');
  assert.ok('[post] - Missing data params');

  const client = await getClient();
  await client.db(dbName).collection(collection).insertOne(data);
  client.close();
};

const getLast = async (dbName, collection, query, projection) => {
  assert.ok(dbName, '[getLast] - Missing dbName params');
  assert.ok(collection, '[getLast] - Missing collection params');
  assert.ok(query, '[getLast] - Missing query params');
  assert.ok(projection, '[getLast] - Missing projection params');

  const client = await getClient();
  const res = await client
    .db(dbName)
    .collection(collection)
    .find(query, projection)
    .sort({ date: -1 })
    .limit(1)
    .toArray();
  client.close();
  return res[0] || {};
};

const getEntities = async (dbName, collection, query, projection) => {
  assert.ok(dbName, '[getLast] - Missing dbName params');
  assert.ok(collection, '[getLast] - Missing collection params');
  assert.ok(query, '[getLast] - Missing query params');
  assert.ok(projection, '[getLast] - Missing projection params');

  const client = await getClient();
  const res = await client.db(dbName).collection(collection).find(query, projection).toArray();
  client.close();
  return res;
};

export default {
  getClient,
  post,
  getLast,
  getEntities,
};

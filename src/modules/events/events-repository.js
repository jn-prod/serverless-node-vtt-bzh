import { nanoid } from 'nanoid';
import assert from 'assert';
import client from '../../utils/db/client';

const DB = 'events';

export default {
  postEventsReport: async ({ data, kind }) => {
    assert.ok(data, '[postEventsReport] - missing data param');
    assert.ok(kind, '[postEventsReport] - missing kind param');
    const collection = 'reports';

    const report = {
      id: nanoid(10),
      data,
      kind,
      date: new Date().toISOString(),
      count: data.length,
    };

    try {
      await client.post(DB, collection, report);
    } catch (e) {
      console.error(`[postEventsReport] - cannot post report in db: ${e}`);
    }
  },
  getLastEventsReport: () => {
    const collection = 'reports';
    return client.getLast(DB, collection, {});
  },
  getEvents: () => {
    const collection = 'events';
    return client.getEntities(DB, collection, {});
  },
};

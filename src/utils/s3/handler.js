import _ from 'lodash';
import put from './put';

exports.bucketPut = async (event, ctx, cb) => {
  console.log('[bucketPut] - event:');
  console.log(event);
  console.log('[bucketPut] - ctx:');
  console.log(ctx);
  try {
    if (event.statusCode === 200 && _.get(event, 'body.data')) {
      const res = await put(event.body);
      cb(null, res);
    } else {
      console.log('[bucketPut] - event payload cannot be parsed');
      cb(new Error('[bucketPut] - event payload cannot be parsed'));
    }
  } catch (e) {
    console.error(`[bucketPut] - ${e}`);
    cb(e);
  }
};

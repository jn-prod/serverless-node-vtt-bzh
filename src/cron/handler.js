import run from '../modules/events/events-runner';
import eventsRepository from '../modules/events/events-repository';

exports.cron = async (event, ctx, cb) => {
  console.log('[cron] - event:');
  console.log(event);
  console.log('[cron] - ctx:');
  console.log(ctx);
  try {
    const data = await run();
    console.log('[cron] - succeed to get events');

    const body = { data, kind: 'event', count: data.length };

    await eventsRepository.postEventsReport(body);

    const response = {
      statusCode: 200,
      body: JSON.stringify(body), // body must be stringify
      headers: { 'Content-Type': 'application/json' },
    };
    cb(null, response);
  } catch (e) {
    console.error(`[cron] - failed to get events with error: ${e}`);
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: e,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
    cb(e, response);
  }
};

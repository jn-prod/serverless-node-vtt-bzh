import getAll from '../modules/events/events-service';

exports.getAllEvents = async (event, ctx, cb) => {
  console.log('[getAllEvents] - event:');
  console.log(event);
  console.log('[getAllEvents] - ctx:');
  console.log(ctx);
  try {
    const { data: events, count, kind } = await getAll();
    console.log(events);
    console.log('[getAllEvents] - succeed to get events');
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify({ data: events, kind, count }), // body must be stringify
    };
    cb(null, response);
  } catch (e) {
    console.error(`[getAllEvents] - failed to get events with error: ${e}`);
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

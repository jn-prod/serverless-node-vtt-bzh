import eventsRepository from './events-repository';

let eventsCache;
export default async function getAll() {
  try {
    if (eventsCache) return eventsCache;
    const eventsReport = await eventsRepository.getLastEventsReport();
    const eventsItems = await eventsRepository.getEvents();
    eventsItems.forEach((element) => {
      eventsReport.data.push(element);
    });

    eventsCache = eventsReport;

    return eventsCache;
  } catch (e) {
    console.error(`[getAll] - cannot get events due to error: ${e}`);
    throw e;
  }
}

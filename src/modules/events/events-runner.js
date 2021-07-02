/* eslint-disable camelcase */
import axios from 'axios';
import { parse } from 'node-html-parser';
import assert from 'assert';
import Promise from 'bluebird';
import _ from 'lodash';
import iconv from 'iconv-lite';

import config from '../../config/default';
import eventsRepository from './events-repository';

const txt_ref_int_nom_2 = '#txt_ref_int_nom_2';
const txt_ref_int_lieu_2 = '#txt_ref_int_lieu_2';
const txt_ref_int_dpt_2 = '#txt_ref_int_dpt_2';
const txt_ref_int_date_2 = '#txt_ref_int_date_2';
const txt_ref_int_organisateur_2 = '#txt_ref_int_organisateur_2';
const txt_ref_int_horaires_2 = '#txt_ref_int_horaires_2';
const StyleLien1 = '#StyleLien1';
const txt_ref_int_prix2 = '#txt_ref_int_prix2';
const txt_ref_int_contacttxt = '#txt_ref_int_contacttxt';
const txt_ref_int_decription = '#txt_ref_int_decription';
const zone_texte_annule = '#zone_texte_annule';
const txt_ref_int_ldrdv_2 = '#txt_ref_int_ldrdv_2';

axios.interceptors.response.use((response) => {
  const ctype = response.headers['content-type'];
  response.data = ctype.includes('ISO-8859-1')
    ? iconv.decode(response.data, 'latin1')
    : iconv.decode(response.data, 'utf-8');
  return response;
});

const getUrl = (year) => {
  const yearToProcess = year || new Date().getFullYear();
  return `${config.baseUrl}/sorties/vtt/${yearToProcess}-avenir-56-29-22-35-44-0-0-0-1.html`;
};

const parseUrls = (body) => {
  assert.ok(body, '[parseUrls] - missing body param');
  const root = parse(body);

  return root
    .querySelectorAll('a')
    .filter((e) => e.text === 'VOIR')
    .map((e) => e.getAttribute('href').replace('../../', '/'));
};

const getUrls = async () => {
  const currentYear = Number(new Date().getFullYear());
  const startUrl = getUrl(currentYear);

  let res = [];
  try {
    const { data: bodyStart } = await axios.get(startUrl);
    res = [...parseUrls(bodyStart)];
  } catch (e) {
    console.error(`[getUrls] - error in process ${getUrls}`);
  }
  return res;
};

const extractWithCss = (root, selector) => {
  assert.ok(root, '[extractWithCss] - missing $ param');
  assert.ok(selector, '[extractWithCss] - missing selector param');

  const text = _.get(root.querySelector(selector), 'text', '').trim();
  return text.split('').join('€');
};
const canceled = (root, selector) => {
  assert.ok(root, '[canceled] - missing $ param');
  assert.ok(selector, '[canceled] - missing selector param');

  const notCanceled = root.querySelector(selector) === null;

  if (notCanceled) return false;

  const maybeCanceled = _.get(root.querySelector('head'), 'innerHTML', '').indexOf('crise_sanitaire_v1') > -1;

  return !maybeCanceled;
};
const parseEvent = (body) => {
  assert.ok(body, '[parseEvent] - missing body param');
  const root = parse(body);

  return {
    name: extractWithCss(root, txt_ref_int_nom_2),
    city: extractWithCss(root, txt_ref_int_lieu_2),
    departement: extractWithCss(root, txt_ref_int_dpt_2),
    date: extractWithCss(root, txt_ref_int_date_2),
    organisateur: extractWithCss(root, txt_ref_int_organisateur_2),
    hour: extractWithCss(root, txt_ref_int_horaires_2),
    website: extractWithCss(root, StyleLien1),
    place: extractWithCss(root, txt_ref_int_ldrdv_2),
    price: extractWithCss(root, txt_ref_int_prix2),
    contact: extractWithCss(root, txt_ref_int_contacttxt),
    description: extractWithCss(root, txt_ref_int_decription),
    canceled: canceled(root, zone_texte_annule),
  };
};

const getEvents = async (urls) => {
  assert.ok(urls, '[getEvents] - Missing urls param');
  return Promise.map(
    urls,
    async (url) => {
      console.log(`process ${url} ...`);
      try {
        const { status, data } = await axios({
          method: 'GET',
          url: `${config.baseUrl}${url}`,
          responseType: 'arraybuffer',
          reponseEncoding: 'binary',
        });
        if (status !== 200) {
          console.error(`[getEvents] fail to process${url}: ${status}, ${data}`);
          return;
        }
        const event = parseEvent(data);

        console.log(event);
        console.log(`... done ${url}`);
        // eslint-disable-next-line consistent-return
        return event;
      } catch (e) {
        console.error(`[getEvents] - error occure whith axios.get: ${e}`);
      }
    },
    { concurrency: 3 }
  ).catch((e) => console.error(`[getEvents] - error occure : ${e}`));
};

export default async function run() {
  const start = new Date().getTime();
  console.log('start cron ...');
  try {
    const urls = await getUrls();

    console.log(`we have get ${urls.length} events urls from website`);

    const dbEventsUrls = await eventsRepository.getEvents({ url: { $exists: true } }, { url: true });

    console.log(`we have get ${dbEventsUrls.length} events urls from db`);

    const urlsToProcess = urls.filter((url) => {
      return !dbEventsUrls.filter((e) => url.indexOf(e.url) > -1).length > 0;
    });

    console.log(`we have ${urlsToProcess.length} events to process`);

    const events = await getEvents(urlsToProcess);

    console.log(`we have process ${events.length} events`);

    return events;
  } catch (e) {
    console.error(`[run] - ${e}`);
    throw e;
  } finally {
    console.log(`... end cron (${Math.floor((new Date().getTime() - start) / 1000)}s)`);
  }
}

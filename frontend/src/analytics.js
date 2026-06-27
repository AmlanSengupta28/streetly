import { track } from '@vercel/analytics';

export const Events = {
  TAB_SWITCH: 'tab_switch',
  REPORT_PUBLISHED: 'report_published',
  NEARBY_REQUESTED: 'nearby_requested',
  SEARCH_QUERY: 'search_query',
  REPORT_CARD_OPENED: 'report_card_opened',
};

export function trackEvent(event, props = {}) {
  try {
    track(event, props);
  } catch {
    // analytics is best-effort; never crash the app
  }
}

import getMessages from '../../common/getMessages';

import getUserStatusHistory from './getUserStatusHistory';

const SEARCH_INPUT = document.getElementById('search-private');
const SEARCH_BUTTON = document.getElementById('search-button');
const loadMore = document.getElementById('load-more');

export default (isPublic) => {
  SEARCH_BUTTON.addEventListener('click', () => {
    if (SEARCH_INPUT.value !== 'status' || isPublic) {
      return getMessages({
        channel: window.channelId,
        search: SEARCH_INPUT.value,
      });
    }
    return getUserStatusHistory({ channel: window.channelId });
  });

  loadMore.addEventListener('click', () => {
    getMessages({
      channel: window.channelId,
      search: SEARCH_INPUT.value,
      current: loadMore.value,
    });
  });
};

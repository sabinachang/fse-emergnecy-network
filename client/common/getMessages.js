import apiClient from '../utils/apiClient';
import getStatusIcon from './getStatusIcon';

function renderEmptyWall(channel) {
  const type = channel === 'announcement' ? 'announcemnts' : 'messages';
  const publicWall = document.getElementById('messages');
  publicWall.innerHTML = `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">No ${type} to show</h5>
    </div>
  </div>
  `;
}

function renderWall(messages, channel) {
  const getIcon = (status) => {
    if (channel === 'announcement') {
      return '';
    }
    return getStatusIcon(status);
  };

  const showHelpTypes = (helps) => {
    if (helps === undefined) {
      return ``;
    }

    if (helps.length === 0) {
      return ``;
    }

    const helpText = `${helps.join(', ')}`;
    return `
    <footer class="blockquote-footer"><cite>Looking for: ${helpText}</cite></footer>
    `;
  };
  const border = (index) => {
    if (index === 0) {
      return 'border';
    }
    return 'border-top-0';
  };

  const publicWall = document.getElementById('messages');

  const oldMessages = publicWall.innerHTML;
  const newMessages = messages
    .map((message, index) => {
      return `
      <div class="card rounded-0 ${border(index)}">
        <div class="card-body">
          <div class="d-flex flex-row">
            <h5 class="card-title align-self-baseline font-weight-bold mb-2">
              ${message.user.username}
            </h5>
            <span class="${getIcon(
              message.status,
            )} ml-2 mr-2 align-self-baseline"></span>
            <small class="card-subtitle mb-2 align-self-baseline text-muted">${new Date(
              message.created_at,
            ).toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            </small>
          </div>
          <p class="card-text pt-4">${message.content}</p>
          ${showHelpTypes(message.help_types)}
        </div>
      </div>
      `;
    })
    .join('');

  publicWall.innerHTML = oldMessages + newMessages;
}

function clearWall() {
  document.getElementById('messages').innerHTML = ``;
}

function renderLoadMoreBtn(limit, total, current) {
  const loadMore = document.getElementById('load-more');

  if (current * limit >= total) {
    // all messages displayed, load more not required
    loadMore.value = 1;
    loadMore.style.display = 'none';
    return;
  }

  // more results to go, show load more
  loadMore.style.display = 'block';
  loadMore.value = current + 1;
}

async function getMessages({ channel, ...params } = {}) {
  const { data: messages, limitNumber, total, current } = await apiClient.get(
    '/messages',
    {
      params: {
        ...params,
        channel,
      },
    },
  );
  renderLoadMoreBtn(limitNumber, total, current);
  if (total === 0) {
    renderEmptyWall(params.channel);
    return;
  }

  if (current === 1) {
    clearWall();
  }
  renderWall(messages, params.channel);
}

async function getMatchingPosts() {
  const { data, total, current } = await apiClient.get('/matchingPosts');

  if (total === 0) {
    renderEmptyWall('match');
    return;
  }

  if (current === 1) {
    clearWall();
  }
  const messages = [];
  data.forEach((d) => {
    messages.push(d.message);
  });
  renderWall(messages, 'match');
}

export { getMatchingPosts };
export default getMessages;

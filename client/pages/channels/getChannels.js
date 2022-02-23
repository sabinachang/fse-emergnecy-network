import apiClient from '../../utils/apiClient';

function renderItem(channel, title) {
  const { unread_messages_count: unreadMessagesCount, id } = channel;
  return `
    <a class="list-group-item d-flex justify-content-between align-items-center" href=${`/channels/${id}`}>
      <div>
        ${title}
      </div>
      <span class="badge badge-primary badge-pill">${unreadMessagesCount}</span>
    </a>
  `;
}

function getPublicChannelIcons(name) {
  switch (name) {
    case 'public':
      return '<i class="far fa-clipboard mr-2"></i>';
    case 'announcement':
      return '<i class="fa fa-bullhorn mr-2"></i>';
    default:
      return undefined;
  }
}

function getOtherUsersInChannel(channel) {
  return channel.users
    .map((u) => u.username)
    .filter((u) => u !== window.currentUsername);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default async () => {
  const el = document.getElementById('channels');
  const { data: privateChannels } = await apiClient.get('/channels/private');
  const { data: publicChannels } = await apiClient.get('/channels/public');
  el.innerHTML = `
    <h4 class='mt-3'>Public</h4>
    <div class="list-group mt-2">
      ${publicChannels
        .map((channel) =>
          renderItem(
            channel,
            getPublicChannelIcons(channel.name) +
              capitalizeFirstLetter(channel.name),
          ),
        )
        .join('')}
    </div>
    <h4 class='mt-3'>Private</h4>
    <div class="list-group mt-2">
      ${privateChannels
        .map((channel) => renderItem(channel, getOtherUsersInChannel(channel)))
        .join('')}
    </div>
  `;
};

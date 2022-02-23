import io from 'socket.io-client';
import getMessages from '../../common/getMessages';
import handlePostMessage from '../../common/handlePostMessage';
import readMessagesFromChannel from './readMessagesFromChannel';
import alertMessage from './alertMessage';
import handleSearchMessage from './handleSearchMessage';
import client from '../../utils/apiClient';

function initSocket(socket) {
  socket.on('updateMessages', (channelId, data) => {
    getMessages({ channel: window.channelId });
    alertMessage(channelId, data.from);
    readMessagesFromChannel(window.channelId);
  });
}

async function main() {
  const socket = io();
  initSocket(socket);
  readMessagesFromChannel(window.channelId);
  getMessages({ channel: window.channelId });

  const channel = await client.get(`channels/${window.channelId}`);
  handlePostMessage(channel.isPublic ? channel.name : window.channelId);
  handleSearchMessage(channel.isPublic);
}
document.addEventListener('DOMContentLoaded', main);

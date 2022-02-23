import io from 'socket.io-client';
import getChannels from './getChannels';
import alertMessage from '../channel/alertMessage';

function initSocket(socket) {
  socket.on('updateMessages', (channelId, data) => {
    alertMessage(channelId, data.from);
    getChannels();
  });
}

function main() {
  const socket = io();
  initSocket(socket);
  getChannels();
}
document.addEventListener('DOMContentLoaded', main);

import io from 'socket.io-client';
import getUsers from './getUsers';
import handleFindOrCreateChannel from './handleFindOrCreateChannel';
import handleSearchUsers from './handleSearchUsers';
import alertMessage from '../channel/alertMessage';

function initSocket(socket) {
  socket.on('updateUsers', () => {
    getUsers();
  });
  socket.on('updateMessages', (channelId, data) => {
    alertMessage(channelId, data.from);
  });
}

function main() {
  const socket = io();
  initSocket(socket);
  handleSearchUsers();
  getUsers().then(handleFindOrCreateChannel);
}
document.addEventListener('DOMContentLoaded', main);

import io from 'socket.io-client';
import { getMatchingPosts } from '../../common/getMessages';

function bindCloseBtn() {
  const close = document.getElementById('close');
  close.addEventListener('click', () => {
    window.location = '/';
  });
}

function initSocket(socket) {
  socket.on('updateMatchPosts', () => {
    getMatchingPosts();
  });
}

function main() {
  const socket = io();
  initSocket(socket);
  bindCloseBtn();
  getMatchingPosts();
}

document.addEventListener('DOMContentLoaded', main);

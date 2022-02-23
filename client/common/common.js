import './base.css';
import './layout.css';
import io from 'socket.io-client';
import apiClient from '../utils/apiClient';

async function updateCount() {
  const { count } = await apiClient.get('/matchingPosts/count');
  if (count !== 0) {
    document.getElementById('post-count-nav').innerHTML = count;
    document.getElementById('post-count').innerHTML = count;
  }
}

function initSocket(socket) {
  socket.on('updateMatchPosts', () => {
    updateCount();
  });
  socket.on('kickout', () => {
    window.location = '/logout';
  });
}

function bindViewPost() {
  const link = document.getElementById('match-post');
  link.addEventListener('click', () => {
    document.getElementById('post-count-nav').innerHTML = '';
    document.getElementById('post-count').innerHTML = '';
    window.location = '/match-posts';
  });
}

function main() {
  const socket = io();
  initSocket(socket);
  updateCount();
  bindViewPost();
}
document.addEventListener('DOMContentLoaded', main);

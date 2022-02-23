import io from 'socket.io-client';
import apiClient from '../../utils/apiClient';
import geolocation from './geolocation';
import image from './icons/user.png';

const socket = io();

function renderMarker(map, markers, user) {
  const marker = new google.maps.Marker({
    clickable: true,
    icon: image,
    animation: google.maps.Animation.DROP,
    title: user.username,
    shadow: null,
    zIndex: 999,
  });
  marker.setPosition({
    lat: user.coordinates.latitude,
    lng: user.coordinates.longitude,
  });
  marker.setMap(map);
  const infowindow = new google.maps.InfoWindow({
    content: `
    <div class="card border-0" style="width: 12rem">
      <div class="card-body">
        <h5 class="card-title mb-4">
          ${user.username}
          <small>(Status: ${user.status})</small>
        </h5>
        <div class="text-center">
          <button class="btn btn-primary btn-sm" onclick="handleCreateChat('${user.username}')">Chat</button>
        </div>
      </div>
    </div>
    `,
  });
  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });
  // eslint-disable-next-line
  markers[user.id] = marker;
  return marker;
}

window.handleCreateChat = async function handleCreateChat(username) {
  const { id } = await apiClient.post('/channels', {
    usernames: [username],
  });
  window.location = `/channels/${id}`;
};

export default async (map) => {
  const { coords } = await geolocation.getPosition();
  const { data: users } = await apiClient.get('/users', {
    params: {
      longitude: coords.longitude,
      latitude: coords.latitude,
      // in meters
      near: 10000,
    },
  });
  const markers = {};
  users.forEach((user) => {
    renderMarker(map, markers, user);
  });
  socket.on('locationUpdated', (user) => {
    if (window.username === user.username) {
      return;
    }
    if (markers[user.id]) {
      markers[user.id].setPosition({
        lat: user.coordinates.latitude,
        lng: user.coordinates.longitude,
      });
    } else {
      markers[user.id] = renderMarker(map, markers, user);
    }
  });
  socket.on('logout', (userId) => {
    markers[userId].setMap(null);
    delete markers[userId];
  });
};

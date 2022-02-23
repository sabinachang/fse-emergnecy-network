import { Loader } from '@googlemaps/js-api-loader';
import handleCurrentLocation from './handleCurrentLocation';
import renderCurrentLocation from './renderCurrentLocation';
import handleConsentSharingLocation from './handleConsentSharingLocation';
import geolocation from './geolocation';
import handleLocationUpdate from './handleLocationUpdate';
import handleUsers from './handleUsers';
import handleShelters from './handleShelters';
import handleEmergencies from './handleEmergencies';

const loader = new Loader({
  apiKey: 'AIzaSyBqVbvnpQKMU_DWMj31hfHg9tRK3DawkAw',
  version: 'weekly',
  mapIds: ['bac37b5bba2a259c'],
});

async function main() {
  try {
    const position = await geolocation.getPosition();
    await loader.load();
    const pos = geolocation.transformPosition(position);
    const map = new google.maps.Map(document.getElementById('map'), {
      center: pos,
      zoom: 14,
      mapId: 'bac37b5bba2a259c',
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: true,
    });
    renderCurrentLocation(map, pos);
    handleCurrentLocation(map);
    geolocation.on('update', handleLocationUpdate(map));
    handleConsentSharingLocation(map);
    handleUsers(map);
    handleShelters(map);
    handleEmergencies(map);
  } catch (e) {
    document.getElementById('map').innerHTML = `
      <h2>Please enable geolocation to use the map feature</h2>
    `;
  }
}

document.addEventListener('DOMContentLoaded', main);

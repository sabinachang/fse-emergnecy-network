import { Loader } from '@googlemaps/js-api-loader';
import handleShelterCheckinout from './handleShelterCheckinout';

const loader = new Loader({
  apiKey: 'AIzaSyBqVbvnpQKMU_DWMj31hfHg9tRK3DawkAw',
  version: 'weekly',
  mapIds: ['bac37b5bba2a259c'],
});

async function main() {
  handleShelterCheckinout();

  await loader.load();
  const pos = {
    lat: window.shelter.coordinates.latitude,
    lng: window.shelter.coordinates.longitude,
  };
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
  const marker = new google.maps.Marker({
    position: pos,
    map,
  });

  return marker;
}

document.addEventListener('DOMContentLoaded', main);

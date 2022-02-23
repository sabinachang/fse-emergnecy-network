import apiClient from '../../utils/apiClient';
import fireImage from './icons/fire.png';
import cycloneImage from './icons/cyclone.png';
import thunderstormImage from './icons/thunderstorm.png';
import tsunamiImage from './icons/tsunami.png';
import geolocation from './geolocation';

const MAX_DISTANCE = 300 * 1000;

function getSizeBySeverity(severity) {
  switch (severity) {
    case 'Emergency':
      return 80;
    case 'Medium':
      return 40;
    case 'Relax':
      return 20;
    default:
      return 0;
  }
}
function getIconByEmergencyType(type) {
  switch (type) {
    case 'Bushfire':
      return fireImage;
    case 'Cyclone':
      return cycloneImage;
    case 'Thunderstorm':
      return thunderstormImage;
    case 'Tsunami':
      return tsunamiImage;
    default:
      throw new Error('no such type of emergency');
  }
}

async function getEmergencies() {
  const { coords } = await geolocation.getPosition();
  const afterDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const { data: emergencies } = await apiClient.get('/emergencies', {
    params: {
      maxDistance: MAX_DISTANCE,
      longitude: coords.longitude,
      latitude: coords.latitude,
      afterDate,
    },
  });
  return emergencies;
}

function renderMarker(map, emergency) {
  const iconSize = getSizeBySeverity(emergency.severity);
  const marker = new google.maps.Marker({
    clickable: true,
    icon: {
      url: getIconByEmergencyType(emergency.type),
      scaledSize: new google.maps.Size(iconSize, iconSize),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(iconSize, iconSize),
    },
    animation: google.maps.Animation.DROP,
    title: emergency.type,
    shadow: null,
    zIndex: 999,
  });
  marker.setPosition({
    lat: emergency.location.coordinates[1],
    lng: emergency.location.coordinates[0],
  });
  marker.setMap(map);
  const dateString = emergency.createdAt.toString();
  const infowindow = new google.maps.InfoWindow({
    content: `
    <div class="card border-0" style="width: 12rem">
      <div class="card-body" style="padding: 0">
        <h5 class="card-title mb-4">
          ${emergency.type}
        </h5>
        <p>Distance: ${(emergency.distance / 1000).toFixed(2)}km</p>
        <p>Severity: ${emergency.severity}</p>
        <p>Reported at: ${`${dateString.slice(0, 10)} ${dateString.slice(
          11,
          16,
        )}`}</p>
      </div>
    </div>
    `,
  });
  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });
  google.maps.event.addListener(map, 'click', () => {
    infowindow.close();
  });
  return marker;
}

export default async (map) => {
  const emergencies = await getEmergencies();
  emergencies.forEach((emergency) => renderMarker(map, emergency));
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
};

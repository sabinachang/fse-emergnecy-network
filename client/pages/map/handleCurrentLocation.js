import renderLocationButton from './renderLocationButton';
import renderCurrentLocation from './renderCurrentLocation';
import geolocation from './geolocation';

function handleLocationError(e, map, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(e.message);
  infoWindow.open(map);
}

export default function handleCurrentLocation(map) {
  const infoWindow = new google.maps.InfoWindow();
  const locationButton = renderLocationButton();
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);
  locationButton.addEventListener('click', async () => {
    const position = await geolocation.getPosition();
    const pos = await geolocation.transformPosition(position);
    // Try HTML5 geolocation.
    try {
      map.setCenter(pos);
      renderCurrentLocation(map, pos);
    } catch (e) {
      handleLocationError(e, map, infoWindow, map.getCenter());
    }
  });
}

import apiClient from '../../utils/apiClient';
import image from './icons/evacuation.png';
import geolocation from './geolocation';

function renderMarker(map, ec) {
  const marker = new google.maps.Marker({
    clickable: true,
    icon: image,
    animation: google.maps.Animation.DROP,
    title: ec.name,
    shadow: null,
    zIndex: 999,
  });
  marker.setPosition({
    lat: ec.coordinates.latitude,
    lng: ec.coordinates.longitude,
  });
  marker.setMap(map);
  const infowindow = new google.maps.InfoWindow({
    content: `
    <div class="card border-0" style="width: 12rem">
      <div class="card-body">
        <h5 class="card-title mb-4">
          ${ec.name}
        </h5>
        <p>${ec.description}</p>
        <div class="text-center">
          <button class="btn btn-primary btn-sm" onclick="handleNavigateTo({lat: ${ec.coordinates.latitude}, lng: ${ec.coordinates.longitude}})">Navigate</button>
        </div>
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
  const { data } = await apiClient.get('/shelters');
  data.forEach((ec) => renderMarker(map, ec));
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  window.handleNavigateTo = async (pos) => {
    const current = await geolocation.getPosition();

    const request = {
      origin: new google.maps.LatLng(
        current.coords.latitude,
        current.coords.longitude,
      ),
      destination: new google.maps.LatLng(pos.lat, pos.lng),
      provideRouteAlternatives: false,
      travelMode: 'DRIVING',
      drivingOptions: {
        departureTime: new Date(/* now, or future date */),
        trafficModel: 'pessimistic',
      },
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    };

    directionsService.route(request, (result) => {
      if (result.status === 'OK') {
        directionsRenderer.setDirections(result);
      }
    });
  };
};

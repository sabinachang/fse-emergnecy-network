import shareLocation from './shareLocation';
import renderCurrentLocation from './renderCurrentLocation';

export default (map) => (err, position) => {
  if (err) {
    return;
  }
  const posi = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
  shareLocation.send(posi);
  renderCurrentLocation(map, posi);
};

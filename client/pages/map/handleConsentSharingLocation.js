import shareLocation from './shareLocation';
import geolocation from './geolocation';

export default async () => {
  const position = await geolocation.getPosition();
  const pos = geolocation.transformPosition(position);
  shareLocation.start();
  shareLocation.send(pos);
};

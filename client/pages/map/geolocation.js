import EventEmitter from 'events';

const ee = new EventEmitter();
navigator.geolocation.watchPosition(
  (position) => {
    ee.emit('update', null, position);
    ee.error = null;
    ee.position = position;
  },
  (err) => {
    // eslint-disable-next-line
    console.warn(`ERROR(${err.code}): ${err.message}`);
    ee.error = err;
    ee.emit('update', err, null);
  },
  {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0,
  },
);

ee.getPosition = async () => {
  if (ee.position) {
    return ee.position;
  }
  if (ee.error) {
    return Promise.reject(ee.error);
  }
  await new Promise((res) => setTimeout(res, 1000));
  return ee.getPosition();
};

ee.transformPosition = (position) => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude,
});

export default ee;

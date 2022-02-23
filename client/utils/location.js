export default function getLocation() {
  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: Infinity,
    };

    const success = (pos) => resolve(pos);
    const error = (err) => reject(err);

    navigator.geolocation.getCurrentPosition(success, error, options);
  });
}

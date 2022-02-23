export default function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }, reject);
    } else {
      const e = new Error("Error: Your browser doesn't support geolocation.");
      e.type = 'NavigationNotAvailable';
      reject(e);
    }
  });
}

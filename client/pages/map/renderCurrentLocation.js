let marker;
export default (map, pos) => {
  if (!marker) {
    marker = new google.maps.Marker({
      clickable: false,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillOpacity: 1,
        strokeWeight: 2,
        fillColor: '#5384ED',
        strokeColor: '#ffffff',
      },
      shadow: null,
      zIndex: 999,
      map,
    });
  }
  marker.setPosition(pos);
};

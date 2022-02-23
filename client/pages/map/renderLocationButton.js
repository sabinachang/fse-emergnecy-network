import image from './icons/precision.png';

export default function renderLocationButton() {
  const locationButton = document.createElement('button');
  locationButton.style.backgroundColor = '#fff';
  locationButton.style.backgroundImage = `url(${image})`;
  locationButton.style.backgroundSize = '28px';
  locationButton.style.backgroundPosition = '4px';
  locationButton.style.backgroundRepeat = 'no-repeat';
  locationButton.style.border = '2px solid #fff';
  locationButton.style.borderRadius = '3px';
  locationButton.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  locationButton.style.cursor = 'pointer';
  locationButton.style.marginRight = '10px';
  locationButton.style.height = '40px';
  locationButton.style.width = '40px';
  locationButton.style.textAlign = 'center';
  locationButton.title = 'Current Location';
  return locationButton;
}

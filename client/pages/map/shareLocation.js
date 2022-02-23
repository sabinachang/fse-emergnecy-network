import apiClient from '../../utils/apiClient';

let isStarted = false;

const start = () => {
  isStarted = true;
};

const stop = () => {
  isStarted = false;
};

const send = ({ lat, lng }) => {
  if (!isStarted) {
    return false;
  }
  apiClient
    .patch(`/users/${window.username}/location`, {
      latitude: lat,
      longitude: lng,
    })
    .then(() => {})
    .catch(() => {});
  return true;
};

export default {
  start,
  stop,
  send,
};

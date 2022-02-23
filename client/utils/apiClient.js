import axios from 'axios';
import Swal from 'sweetalert2';

const client = axios.create({
  headers: {
    Accept: 'application/json',
  },
  baseURL: '/api',
});

// for success response, we do not need http meta data
client.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    // for failed response, we by default pop up an error message
    // TODO: maybe use a toast message without blocking the whole screen
    if (err.response) {
      Swal.fire({
        title: 'Error',
        text: err.response.data.message,
        icon: 'error',
      });
    }
    return Promise.reject(err);
  },
);

export default client;

import axios from 'axios';
import Swal from 'sweetalert2';
import welcomeMessage from './welcomeMessage';
import './join-community.css';

function main() {
  const form = document.getElementById('registerForm');
  const username = document.getElementById('username');
  const password = document.getElementById('password');

  function submitData({ confirmCreation }) {
    return axios
      .post('/api/authorizations', {
        username: username.value,
        password: password.value,
        confirm_creation: confirmCreation,
      })
      .then((response) => {
        if (response.data.is_new) {
          return Swal.fire({
            title: 'Welcome!',
            text: `Welcome onboard, ${username.value}, are your sure you want to join our awesome community?`,
            icon: 'warning',
            showDenyButton: true,
            confirmButtonText: 'Yes!',
            denyButtonText: 'No',
          }).then((result) => {
            if (result.isDismissed || result.isDenied) {
              const e = new Error('Dismissed');
              e.name = 'Dismissed';
              throw e;
            }
            if (result.isConfirmed) {
              return submitData({ confirmCreation: true });
            }
            return response;
          });
        }
        return response;
      })
      .then((response) => {
        if (response.data.show_welcome_message) {
          return Swal.fire({
            title: `Welcome onboard, ${username.value}`,
            html: welcomeMessage,
            input: 'checkbox',
            inputPlaceholder: 'I understand each status',
            confirmButtonText: 'Continue',
            inputValidator: (result) => {
              return !result && 'Please acknowledge';
            },
            allowOutsideClick: false,
            icon: 'success',
          }).then((result) => {
            if (result.isDismissed) {
              const e = new Error('Dismissed');
              e.name = 'Dismissed';
              throw e;
            }
            return response;
          });
        }
        return response;
      })
      .then(() => {
        // hard refresh to let server control the rest of the flow
        window.location = '/';
      })
      .catch((e) => {
        // modal dismissed, do nothing
        if (e.name === 'Dismissed') {
          return;
        }
        if (e.response && [422, 409].includes(e.response.status)) {
          Swal.fire({
            title: 'Error',
            text: e.response.data.message,
            icon: 'error',
          });
        }
        if (e.response && e.response.status === 403) {
          Swal.fire({
            title: 'Error',
            text:
              'User is inactive, please contact your administor to re-activate your account.',
            icon: 'error',
          });
        }
      });
  }

  form.addEventListener('submit', (e) => {
    let errors;

    e.preventDefault();

    errors = 0;
    if (username.value.length < 3) {
      username.classList.add('is-invalid');
      errors += 1;
    } else {
      username.classList.remove('is-invalid');
    }

    if (password.value.length < 4) {
      password.classList.add('is-invalid');
      errors += 1;
    } else {
      password.classList.remove('is-invalid');
    }
    if (!errors) {
      submitData({ confirmCreation: false });
    }
  });
}
document.addEventListener('DOMContentLoaded', main);

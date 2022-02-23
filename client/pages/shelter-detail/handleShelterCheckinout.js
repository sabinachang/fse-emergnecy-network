import Swal from 'sweetalert2';
import apiClient from '../../utils/apiClient';

const checkinButton = document.getElementById('checkin');
const checkoutButton = document.getElementById('checkout');

export default function handleShelterRegistration() {
  if (checkinButton) {
    checkinButton.addEventListener('click', async () => {
      Swal.fire({
        title: `Are you sure to Check-in?`,
        showCancelButton: true,
        confirmButtonText: `Yes`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await apiClient.patch(`/users/${window.username}/shelter`, {
            id: window.shelter.id,
          });
          window.location.reload(true);
        }
      });
    });
  }
  if (checkoutButton) {
    checkoutButton.addEventListener('click', async () => {
      await apiClient.patch(`/users/${window.username}/shelter`, {
        id: null,
      });
      window.location.reload(true);
    });
  }
}

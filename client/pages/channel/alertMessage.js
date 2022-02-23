import Swal from 'sweetalert2';

export default (channelID, username) => {
  if (window.location.pathname.replace('/channels/', '') !== channelID) {
    Swal.fire({
      position: 'top',
      title: `You receive a message from ${username}`,
      showCancelButton: true,
      confirmButtonText: `Go`,
    }).then((result) => {
      if (result.isConfirmed) {
        window.location = `/channels/${channelID}`;
      }
    });
  }
};

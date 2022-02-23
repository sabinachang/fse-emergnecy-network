import apiClient from '../../utils/apiClient';

const STATUS_ICONS = {
  Ok: 'fas fa-check-circle text-success',
  Help: 'fa fa-exclamation-circle text-warning',
  Emergency: 'fa fa-plus-circle text-danger',
};

async function getUsers(params = {}) {
  const { data: users } = await apiClient.get('/users', {
    params,
  });

  const usersListContainer = document.getElementById('users-list');
  usersListContainer.innerHTML = `
    <table class="table table-hover">
      <thead>
        <tr>
          <td>Username</td>
          <td>Online status</td>
          <td>Status</td>
          ${window.role === 'administrator' ? `<td>Profile </td>` : ``}
        </tr>
      </thead>
      <tbody>
        ${users
          .map((user) => {
            const profileLink = `/user-profile/${user.username}`;
            return `
            <tr class="user-item" style="cursor: pointer;" data-username="${
              user.username
            }">
              <td>${user.username}</td>
              <td>${user.online ? 'Online' : 'Offline'}</td>
              <td><span class="${STATUS_ICONS[user.status]}"></span> ${
              user.status || ''
            }
            ${
              window.role === 'administrator'
                ? `<td><a class="view-profile" href="${profileLink}">View</a> </td>`
                : ``
            }
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

export default getUsers;

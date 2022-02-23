import apiClient from '../../utils/apiClient';

const privilegeLevel = [
  {
    buttonId: 'citizen-btn',
    level: 'citizen',
  },
  {
    buttonId: 'coordinator-btn',
    level: 'coordinator',
  },
  {
    buttonId: 'administrator-btn',
    level: 'administrator',
  },
];

const activeStatus = [
  {
    buttonId: 'active-btn',
    active: true,
  },
  {
    buttonId: 'inactive-btn',
    active: false,
  },
];

function setCurrentElements(user) {
  const statusDropdown = document.getElementById('account-status-dropdown');
  if (statusDropdown) {
    const statusText = user.active ? 'Active' : 'Inactive';
    statusDropdown.innerHTML = statusText;
  }

  const privilegeDropdown = document.getElementById('privilege-dropdown');
  if (privilegeDropdown) {
    const role = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    privilegeDropdown.innerHTML = `${role}`;
  }
}

async function getProfileElements(username) {
  const { user } = await apiClient.get(`/users/${username}`);
  setCurrentElements(user);
}

async function updateProfileElement(data, username) {
  await apiClient.patch(`/users/${username}`, { user: data });
  window.location.reload();
}

function bindPrivilegeDOM(username) {
  const privilegeDOMs = privilegeLevel.map((level) =>
    document.getElementById(level.buttonId),
  );

  privilegeDOMs.forEach((btnDOM, ind) => {
    if (!btnDOM) {
      return;
    }
    btnDOM.addEventListener('click', () =>
      updateProfileElement(
        {
          role: privilegeLevel[ind].level,
        },
        username,
      ),
    );
  });
}

function bindActiveStatusDOM(username) {
  const activeStatusDOMs = activeStatus.map((status) =>
    document.getElementById(status.buttonId),
  );

  activeStatusDOMs.forEach((btnDOM, ind) => {
    if (!btnDOM) {
      return;
    }
    btnDOM.addEventListener('click', () =>
      updateProfileElement(
        {
          active: activeStatus[ind].active,
        },
        username,
      ),
    );
  });
}

function bindChangeUsernameBtn(username) {
  const changeUsernameBtn = document.getElementById('change-username-btn');
  if (!changeUsernameBtn) {
    return;
  }

  changeUsernameBtn.addEventListener('click', async () => {
    const newUsername = document.getElementById('username-input').value;
    if (newUsername) {
      await apiClient
        .patch(`/users/${username}`, { user: { username: newUsername } })
        .then((response) => {
          window.username = response.username;
          window.location.replace(
            `${window.location.origin}/user-profile/${window.username}`,
          );
        })
        .catch(() => {});
    }
  });
}

function bindChangePasswordBtn(username) {
  const changePasswordBtn = document.getElementById('change-password-btn');
  if (!changePasswordBtn) {
    return;
  }
  changePasswordBtn.addEventListener('click', async () => {
    const newPassword = document.getElementById('password-input').value;
    if (newPassword) {
      await apiClient
        .patch(`/users/${username}`, { user: { password: newPassword } })
        .then(() => {
          window.location.reload();
        })
        .catch(() => {});
    }
  });
}

function initProfileElements(username) {
  getProfileElements(username);
  bindPrivilegeDOM(username);
  bindActiveStatusDOM(username);
  bindChangeUsernameBtn(username);
  bindChangePasswordBtn(username);
}

export default initProfileElements;

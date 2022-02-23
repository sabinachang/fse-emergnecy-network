import apiClient from '../../utils/apiClient';

function renderStatusHistory(sh) {
  const getStatusIcon = (status) => {
    const iconArray = {
      Ok: 'fas fa-check-circle text-success',
      Help: 'fa fa-exclamation-circle text-warning',
      Emergency: 'fa fa-plus-circle text-danger',
    };
    return iconArray[status];
  };

  const border = (index) => {
    if (index === 0) {
      return 'border';
    }
    return 'border-top-0';
  };

  const publicWall = document.getElementById('messages');
  publicWall.innerHTML = sh
    .map((s, i) => {
      return `
        <div class="card rounded-0 ${border(i)}">
            <div class="card-body">
                <div class="d-flex flex-row">
                    <span class="${getStatusIcon(
                      s.status,
                    )} ml-2 mr-1 align-self-baseline"></span>
                    <span class="ml-2 mr-2 align-self-baseline">${
                      s.status
                    }</span>
                    <small class="card-subtitle mb-2 align-self-baseline text-muted">${new Date(
                      s.createdAt,
                    ).toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    </small>
                </div>
            </div>
        </div>
        `;
    })
    .join('');
}

async function getUserStatusHistory({ channel, ...params } = {}) {
  const { data: statusHistory } = await apiClient.get(
    '/channels/statushistories',
    {
      params: {
        ...params,
        channel,
      },
    },
  );
  renderStatusHistory(statusHistory);
}

export default getUserStatusHistory;

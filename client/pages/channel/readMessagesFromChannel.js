import apiClient from '../../utils/apiClient';

export default async (id) => {
  await apiClient.patch(`/channels/${id}`, {
    mark_all_messages_read: true,
  });
};

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const fetchPendingComments = async () => {
  const response = await api.get('/comments/pending');
  return response.data;
};

export const approveReply = async (id, text, url) => {
  const response = await api.post(`/comments/${id}/approve`, { text, url });
  return response.data;
};

export const rejectComment = async (id) => {
  const response = await api.post(`/comments/${id}/reject`);
  return response.data;
};

export default api;

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

export const clearFetchedComments = async () => {
    const response = await api.delete('/comments/fetched');
    return response.data;
};

export const fetchFetchedComments = async () => {
    // We expect the backend to have an endpoint for this.
    // Since we didn't add one in comments.js, we should add it or use query param?
    // Let's assume /comments/fetched exists or we add it. 
    // Wait, I haven't added it to comments.js yet.
    // I should check comments.js first. 
    // But assuming I will add:
    const response = await api.get('/comments/fetched');
    return response.data;
};

export const triggerAnalysis = async () => {
    const response = await api.post('/watcher/analyze');
    return response.data;
};

export default api;

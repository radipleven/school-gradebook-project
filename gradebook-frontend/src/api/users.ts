import api from './index';

export interface User {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get('/users');
  return res.data;
};

export const createUser = async (user: Omit<User, 'id' | 'created_at'> & { password: string }) => {
  const res = await api.post('/users', user);
  return res.data;
};

export const updateUser = async (id: string, user: Partial<Omit<User, 'id' | 'created_at'>>) => {
  const res = await api.put(`/users/${id}`, user);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}; 
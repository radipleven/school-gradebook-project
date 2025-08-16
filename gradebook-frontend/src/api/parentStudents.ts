import api from './index';

export interface ParentStudentLink {
  id: string;
  parent_id: string;
  student_id: string;
  created_at: string;
}

export const getParentStudentLinks = async (parentId: string): Promise<ParentStudentLink[]> => {
  const res = await api.get(`/parent_students/${parentId}`);
  return res.data;
};

export const getAllParentStudentLinks = async (): Promise<ParentStudentLink[]> => {
  try {
    // First, get all users to find parents
    const usersRes = await api.get('/users');
    const users = usersRes.data;
    const parents = users.filter((user: any) => user.role === 'parent');
    
    // Then fetch links for each parent
    const allLinks: ParentStudentLink[] = [];
    for (const parent of parents) {
      try {
        const links = await getParentStudentLinks(parent.id);
        allLinks.push(...links);
      } catch (error) {
        // Skip parents with no links or errors
        console.warn(`Failed to fetch links for parent ${parent.id}:`, error);
      }
    }
    
    return allLinks;
  } catch (error) {
    console.error('Failed to fetch all parent-student links:', error);
    throw error;
  }
};

export const createParentStudentLink = async (link: Omit<ParentStudentLink, 'id' | 'created_at'>) => {
  const res = await api.post('/parent_students', link);
  return res.data;
};

export const deleteParentStudentLink = async (link: ParentStudentLink) => {
  const res = await api.delete(`/parent_students/${link.parent_id}/${link.student_id}`);
  return res.data;
}; 
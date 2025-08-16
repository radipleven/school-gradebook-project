export const canAddStudents = (role: string | null) => ["admin", "director"].includes(role || '');
export const canEditStudents = (role: string | null) => ["admin", "director"].includes(role || '');
export const canDeleteStudents = (role: string | null) => ["admin", "director"].includes(role || '');

export const canAddGrades = (role: string | null) => ["admin", "director", "teacher"].includes(role || '');
export const canEditGrades = (role: string | null) => ["admin", "director", "teacher"].includes(role || '');
export const canDeleteGrades = (role: string | null) => ["admin", "director", "teacher"].includes(role || '');

export const canAddAbsences = (role: string | null) => ["admin", "director", "teacher"].includes(role || '');
export const canEditAbsences = (role: string | null) => ["admin", "director", "teacher"].includes(role || '');
export const canDeleteAbsences = (role: string | null) => ["admin", "director", "teacher"].includes(role || '');
// Add more as needed for other modules 
# School Gradebook Frontend

A modern React frontend for a school gradebook system with role-based access control.

## Features

- **Role-Based Access Control**: Admin, Director, Teacher, Parent, Student roles
- **User Management**: Admin can create and manage users
- **Student Management**: Manage student records and class assignments
- **Grade Management**: Teachers can add/edit grades for students
- **Absence Management**: Track and manage student absences
- **Parent-Student Links**: Connect parents to their children
- **Statistics**: View grade averages and absence counts
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Vite** for build tooling

## Prerequisites

- Node.js 16+ 
- Backend server running on `http://127.0.0.1:3000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Default Test Users

Make sure your backend has these test users:

- **Admin**: `admin@school.com` / `password123`
- **Director**: `director@school.com` / `password123`  
- **Teacher**: `teacher@school.com` / `password123`
- **Parent**: `parent@school.com` / `password123`
- **Student**: `student@school.com` / `password123`

## API Configuration

The frontend expects the backend to be running on `http://127.0.0.1:3000`. 

To change this, edit `src/api/index.ts`:

```typescript
const api = axios.create({
  baseURL: 'http://your-backend-url:port',
});
```

## Role Permissions

| Feature | Admin | Director | Teacher | Parent | Student |
|---------|-------|----------|---------|--------|---------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Parent-Student Links | ✅ | ❌ | ❌ | ❌ | ❌ |
| Students (All) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Students (Own Children) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Students (Self) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Grades (All) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Grades (Own Children) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Grades (Self) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Absences (All) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Absences (Own Children) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Absences (Self) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Statistics | ✅ | ✅ | ✅ | ✅ | ✅ |

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── api/                 # API service layer
├── components/          # Reusable UI components
│   ├── Absences/
│   ├── Auth/
│   ├── Grades/
│   ├── Layout/
│   ├── ParentStudents/
│   ├── Stats/
│   ├── Students/
│   └── Users/
├── context/             # React context providers
├── pages/               # Page components
├── routes/              # Routing configuration
├── utils/               # Utility functions
├── App.tsx
├── main.tsx
└── theme.ts
```

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Test with different user roles
5. Ensure responsive design
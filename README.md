# School Gradebook System

A comprehensive web-based electronic diary system for schools, built with modern technologies and designed to serve administrators, directors, teachers, parents, and students.

## Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [User Roles & Permissions](#-user-roles--permissions)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## Features

### Core Functionality
- **Multi-role Authentication System** - Secure login with role-based access control
- **Student Management** - Complete student enrollment and information management
- **Grade Management** - Comprehensive grading system with subject tracking
- **Absence Tracking** - Record and monitor student attendance
- **Parent-Student Linking** - Connect parents to their children's academic records
- **Statistical Reports** - Generate insights on grades and attendance patterns
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### Role-Specific Features

#### Administrator
- Full system access and user management
- Create, edit, and delete all user accounts
- Manage school-wide data and configurations
- Access comprehensive statistics across all schools
- Oversee parent-student relationships

#### Director (Principal)
- View all school information and statistics
- Manage students, teachers, and academic data
- Access grade distribution and attendance reports
- Oversee curriculum and class assignments
- Monitor school performance metrics

#### Teacher
- Manage grades for assigned students
- Record and track student absences
- View student information and class rosters
- Access teaching-related statistics
- Automatic grade authorship (teachers are auto-assigned to grades they create)

#### Parent
- View children's grades and academic progress
- Monitor attendance and absence records
- Access personalized statistics for their children
- Secure access limited to linked students only

#### Student
- Personal dashboard with "My Info" section
- View personal grades and academic history
- Track personal attendance record
- Access individual academic statistics

## Technology Stack

### Backend
- **Language**: Rust
- **Framework**: Axum (async web framework)
- **Database**: PostgreSQL with SQLx
- **Authentication**: Custom role-based system with bcrypt password hashing
- **API**: RESTful JSON API with comprehensive error handling
- **Security**: CORS enabled, input validation, SQL injection protection

### Frontend
- **Language**: TypeScript
- **Framework**: React 18 with functional components and hooks
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **State Management**: React Context API

### Database
- **Primary Database**: PostgreSQL
- **Migrations**: SQLx migrations for schema management
- **Features**: UUID primary keys, foreign key constraints, indexed queries

## 🏗 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React/TS)    │◄──►│   (Rust/Axum)   │◄──►│  (PostgreSQL)   │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

#### Backend Architecture
- **Authentication Middleware**: Role-based access control on all endpoints
- **Database Layer**: SQLx for type-safe database interactions
- **API Layer**: RESTful endpoints with JSON serialization
- **Error Handling**: Comprehensive error responses with proper HTTP status codes

#### Frontend Architecture
- **Component Structure**: Modular React components with TypeScript
- **Routing**: Protected routes with role-based access
- **State Management**: Context API for authentication and global state
- **UI Components**: Material-UI for consistent design system

## User Roles & Permissions

| Feature | Admin | Director | Teacher | Parent | Student |
|---------|-------|----------|---------|--------|---------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Student Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Students | ✅ | ✅ | ✅ | Own Children | Self Only |
| Grade Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Grades | All | All | All | Own Children | Self Only |
| Absence Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Absences | All | All | All | Own Children | Self Only |
| Statistics | ✅ | ✅ | ✅ | Own Children | Self Only |
| Parent-Student Links | ✅ | ✅ | ❌ | ❌ | ❌ |

## Installation

### Prerequisites
- **Rust** (latest stable version)
- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gradebook/gradebook-backend
   ```

2. **Install Rust dependencies**
   ```bash
   cargo build
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

4. **Configure PostgreSQL**
   ```bash
   # Create database
   createdb gradebook
   
   # Set DATABASE_URL in .env
   DATABASE_URL=postgresql://username:password@localhost/gradebook
   ```

5. **Run database migrations**
   ```bash
   sqlx migrate run
   ```

6. **Start the backend server**
   ```bash
   cargo run
   ```
   Server will start on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../gradebook-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`

### Production Build

#### Backend
```bash
cd gradebook-backend
cargo build --release
./target/release/gradebook-backend
```

#### Frontend
```bash
cd gradebook-frontend
npm run build
npm run preview
```

## API Documentation

### Authentication
All endpoints (except `/login` and `/health`) require the `x-user-id` header with a valid user UUID.

### Core Endpoints

#### Authentication
- `POST /login` - User authentication
- `GET /health` - Health check

#### User Management (Admin Only)
- `GET /users` - List all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Student Management
- `GET /students` - List students (filtered by role)
- `POST /students` - Create student (Admin/Director only)
- `GET /students/:id` - Get student details
- `PUT /students/:id` - Update student (Admin/Director only)
- `DELETE /students/:id` - Delete student (Admin/Director only)

#### Grade Management
- `GET /grades` - List grades (filtered by role)
- `POST /grades` - Create grade
- `PUT /grades/:id` - Update grade
- `DELETE /grades/:id` - Delete grade

#### Absence Management
- `GET /absences` - List absences (filtered by role)
- `POST /absences` - Create absence record
- `PUT /absences/:id` - Update absence
- `DELETE /absences/:id` - Delete absence

#### Statistics
- `GET /stats/avg_grade` - Average grades by student
- `GET /stats/absence_count` - Absence counts by student

#### Parent-Student Relations
- `POST /parent_students` - Link parent to student
- `GET /parent_students/:parent_id` - Get parent's children
- `DELETE /parent_students/:parent_id/:student_id` - Remove parent-student link

### Response Format
All API responses follow a consistent JSON format with appropriate HTTP status codes.

## 🗄 Database Schema

### Core Tables

#### Users
```sql
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- hashed_password (VARCHAR)
- role (ENUM: admin, director, teacher, parent, student)
- first_name (VARCHAR)
- last_name (VARCHAR)
- created_at (TIMESTAMP)
```

#### Students
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users.id)
- class (VARCHAR)
- created_at (TIMESTAMP)
```

#### Grades
```sql
- id (UUID, Primary Key)
- student_id (UUID, Foreign Key → students.id)
- subject (VARCHAR)
- value (INTEGER, 2-6 scale)
- teacher_id (UUID, Foreign Key → users.id)
- created_at (TIMESTAMP)
```

#### Absences
```sql
- id (UUID, Primary Key)
- student_id (UUID, Foreign Key → students.id)
- date (DATE)
- reason (VARCHAR)
- created_at (TIMESTAMP)
```

#### Parent-Student Relations
```sql
- parent_id (UUID, Foreign Key → users.id)
- student_id (UUID, Foreign Key → students.id)
- Primary Key: (parent_id, student_id)
```

## Development

### Backend Development
```bash
# Run with auto-reload
cargo watch -x run

# Run tests
cargo test

# Check code formatting
cargo fmt

# Run linter
cargo clippy
```

### Frontend Development
```bash
# Development server with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

### Database Management
```bash
# Create new migration
sqlx migrate add <migration_name>

# Run migrations
sqlx migrate run

# Revert last migration
sqlx migrate revert
```

## UI/UX Features

### Responsive Design
- Mobile-first approach with Material-UI breakpoints
- Adaptive navigation and layouts
- Touch-friendly interface elements

### Role-Based Interface
- **Students**: Personalized "My Info", "My Grades", "My Absences" sections
- **Parents**: "My Children" focused interface
- **Teachers**: Streamlined grade entry with automatic teacher assignment
- **Administrators**: Comprehensive management interface

### User Experience Enhancements
- Automatic teacher assignment when creating grades
- Student names displayed instead of IDs across all interfaces
- Contextual navigation labels based on user role
- Intuitive card-based layouts for personal information

## Security Features

- **Password Security**: bcrypt hashing with salt
- **Role-Based Access Control**: Strict endpoint permissions
- **SQL Injection Protection**: Parameterized queries with SQLx
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Comprehensive data validation on both frontend and backend
- **Session Security**: Secure user identification system

## Browser Compatibility

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 📱 Mobile Support

The application is fully responsive and optimized for:
- **Tablets**: iPad, Android tablets
- **Smartphones**: iPhone, Android phones
- **Touch interfaces**: Optimized touch targets and gestures

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Rust best practices for backend development
- Use TypeScript and React best practices for frontend
- Maintain consistent code formatting
- Write comprehensive tests
- Update documentation for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies for educational institutions
- Designed with user experience and security as top priorities
- Implements comprehensive role-based access control
- Follows responsive design principles for universal accessibility

---

**Note**: This system is designed for educational purposes and implements a comprehensive school management solution with modern web technologies and security best practices.

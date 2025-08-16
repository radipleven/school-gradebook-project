-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'director', 'teacher', 'student', 'parent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

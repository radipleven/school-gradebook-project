CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

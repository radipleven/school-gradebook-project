CREATE TABLE parent_students (
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
);

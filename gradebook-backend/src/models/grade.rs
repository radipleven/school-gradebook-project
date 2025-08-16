use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, FromRow)]
pub struct Grade {
    pub id: Uuid,
    pub student_id: Uuid,
    pub subject: String,
    pub value: i16,
    pub teacher_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct NewGrade {
    pub student_id: Uuid,
    pub subject: String,
    pub value: i16,
    pub teacher_id: Uuid,
}

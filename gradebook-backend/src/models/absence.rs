use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{NaiveDate, DateTime, Utc};

#[derive(Debug, Serialize, FromRow)]
pub struct Absence {
    pub id: Uuid,
    pub student_id: Uuid,
    pub date: NaiveDate,
    pub reason: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct NewAbsence {
    pub student_id: Uuid,
    pub date: NaiveDate,
    pub reason: Option<String>,
}

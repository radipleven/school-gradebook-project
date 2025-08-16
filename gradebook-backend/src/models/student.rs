use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, FromRow)]
pub struct Student {
    pub id: Uuid,
    pub user_id: Uuid,
    pub class: String,
    pub created_at: DateTime<Utc>,
    // User information fields (when joined)
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub email: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct NewStudent {
    pub user_id: Uuid,
    pub class: String,
}

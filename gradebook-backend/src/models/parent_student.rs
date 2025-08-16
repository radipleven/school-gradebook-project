use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct ParentStudent {
    pub parent_id: Uuid,
    pub student_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct LinkParentStudent {
    pub parent_id: Uuid,
    pub student_id: Uuid,
}

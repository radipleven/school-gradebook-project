use sqlx::{PgPool, postgres::PgPoolOptions};
use std::time::Duration;

pub async fn connect_db() -> PgPool {
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&database_url)
        .await
        .expect("Failed to connect to DB")
}

mod db;
mod models;

use models::parent_student::{ParentStudent, LinkParentStudent};
use models::grade::{Grade, NewGrade};
use models::absence::{Absence, NewAbsence};
use serde::Serialize;

use serde::Deserialize;

use axum::http::StatusCode;
use axum::{
    extract::{State, Json, Path},
    routing::{get, post, put, delete},
    Router,
};

use sqlx::PgPool;
use std::net::SocketAddr;
use models::user::{User, NewUser};
use models::student::{Student, NewStudent};
use uuid::Uuid;



// === Statistics structs ===

#[derive(Serialize)]
struct StudentAvgGrade {
    student_id: uuid::Uuid,
    avg_grade: Option<f64>,
}

#[derive(Serialize)]
struct StudentAbsenceCount {
    student_id: uuid::Uuid,
    absence_count: i64,
}

// === Health check ===

async fn health_check(State(pool): State<PgPool>) -> &'static str {
    if sqlx::query("SELECT 1").execute(&pool).await.is_ok() {
        "DB OK"
    } else {
        "DB ERROR"
    }
}
// === Login handlers ===


#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct LoginResponse {
    user_id: Uuid,
    role: models::user::Role,
    // Optionally include a "token" here if you want to implement JWT later
}

async fn login(
    State(pool): State<PgPool>,
    Json(input): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, (StatusCode, String)> {
   let user = sqlx::query_as::<_, User>(
    r#"
    SELECT * FROM users WHERE email = $1
    "#
)
.bind(&input.email)
.fetch_one(&pool)
.await
.map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid email or password".to_string()))?;

    // Validate password using PostgreSQL's crypt function
    let valid = sqlx::query_scalar!(
        r#"
        SELECT (hashed_password = crypt($1, hashed_password)) as "valid!"
        FROM users WHERE id = $2
        "#,
        input.password,
        user.id
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(false);

    if valid {
        Ok(Json(LoginResponse {
            user_id: user.id,
            role: user.role,
        }))
    } else {
        Err((StatusCode::UNAUTHORIZED, "Invalid email or password".to_string()))
    }
}



// === User handlers ===

async fn create_user(
    State(pool): State<PgPool>,
    Json(input): Json<NewUser>,
) -> Result<Json<User>, String> {
    let row = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (email, hashed_password, role)
        VALUES ($1, crypt($2, gen_salt('bf')), $3)
        RETURNING *
        "#,
    )
    .bind(&input.email)
    .bind(&input.password)
    .bind(&input.role)
    .fetch_one(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Json(row))
}

async fn list_users(State(pool): State<PgPool>) -> Result<Json<Vec<User>>, String> {
    let users = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(Json(users))
}

#[derive(Deserialize)]
struct UpdateUser {
    email: Option<String>,
    password: Option<String>,
    role: Option<models::user::Role>,
}

async fn update_user(
    State(pool): State<PgPool>,
    Path(user_id): Path<Uuid>,
    Json(input): Json<UpdateUser>,
) -> Result<Json<User>, (StatusCode, String)> {
    let updated_user = sqlx::query_as::<_, User>(
        r#"
        UPDATE users
        SET
            email = COALESCE($1, email),
            hashed_password = COALESCE(
                CASE WHEN $2 IS NOT NULL THEN crypt($2, gen_salt('bf')) ELSE NULL END,
                hashed_password
            ),
            role = COALESCE($3, role)
        WHERE id = $4
        RETURNING *
        "#
    )
    .bind(input.email)
    .bind(input.password)
    .bind(input.role)
    .bind(user_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;

    Ok(Json(updated_user))
}

async fn delete_user(
    State(pool): State<PgPool>,
    Path(user_id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let result = sqlx::query!("DELETE FROM users WHERE id = $1", user_id)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "User not found".into()))
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}


// === Student handlers ===

async fn create_student(
    State(pool): State<PgPool>,
    Json(input): Json<NewStudent>,
) -> Result<Json<Student>, String> {
    let student = sqlx::query_as::<_, Student>(
        r#"
        INSERT INTO students (user_id, class)
        VALUES ($1, $2)
        RETURNING *
        "#,
    )
    .bind(input.user_id)
    .bind(input.class)
    .fetch_one(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Json(student))
}

async fn delete_student(
    State(pool): State<PgPool>,
    Path(student_id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let result = sqlx::query!("DELETE FROM students WHERE id = $1", student_id)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Student not found".into()))
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}


async fn list_students(State(pool): State<PgPool>) -> Result<Json<Vec<Student>>, String> {
    let students = sqlx::query_as::<_, Student>("SELECT * FROM students")
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(Json(students))
}

async fn get_student(
    State(pool): State<PgPool>,
    Path(student_id): Path<Uuid>,
) -> Result<Json<Student>, String> {
    let student = sqlx::query_as::<_, Student>("SELECT * FROM students WHERE id = $1")
        .bind(student_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(Json(student))
}

#[derive(Deserialize)]
struct UpdateStudent {
    class: Option<String>,
}

async fn update_student(
    State(pool): State<PgPool>,
    Path(student_id): Path<Uuid>,
    Json(input): Json<UpdateStudent>,
) -> Result<Json<Student>, (StatusCode, String)> {
    let updated_student = sqlx::query_as::<_, Student>(
        r#"
        UPDATE students
        SET
            class = COALESCE($1, class)
        WHERE id = $2
        RETURNING *
        "#
    )
    .bind(input.class)
    .bind(student_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;

    Ok(Json(updated_student))
}


// === Grade handlers ===

async fn create_grade(
    State(pool): State<PgPool>,
    Json(input): Json<NewGrade>,
) -> Result<Json<Grade>, String> {
    let grade = sqlx::query_as::<_, Grade>(
        r#"
        INSERT INTO grades (student_id, subject, value, teacher_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(input.student_id)
    .bind(&input.subject)
    .bind(input.value)
    .bind(input.teacher_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Json(grade))
}

#[derive(Deserialize)]
struct UpdateGrade {
    value: Option<i16>,
    subject: Option<String>,
}

async fn update_grade(
    State(pool): State<PgPool>,
    Path(grade_id): Path<Uuid>,
    Json(input): Json<UpdateGrade>,
) -> Result<Json<Grade>, (StatusCode, String)> {
    // Update only fields provided (dynamic SQL)
    let updated_grade = sqlx::query_as::<_, Grade>(
        r#"
        UPDATE grades
        SET
            value = COALESCE($1, value),
            subject = COALESCE($2, subject)
        WHERE id = $3
        RETURNING *
        "#
    )
    .bind(input.value)
    .bind(input.subject)
    .bind(grade_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;

    Ok(Json(updated_grade))
}


async fn delete_grade(
    State(pool): State<PgPool>,
    Path(grade_id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let result = sqlx::query!("DELETE FROM grades WHERE id = $1", grade_id)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Grade not found".into()))
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}


async fn list_grades(State(pool): State<PgPool>) -> Result<Json<Vec<Grade>>, String> {
    let grades = sqlx::query_as::<_, Grade>("SELECT * FROM grades")
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Json(grades))
}

// === Parent-Student relation handlers ===

async fn link_parent_student(
    State(pool): State<PgPool>,
    Json(input): Json<LinkParentStudent>,
) -> Result<Json<ParentStudent>, String> {
    let record = sqlx::query_as!(
        ParentStudent,
        r#"
        INSERT INTO parent_students (parent_id, student_id)
        VALUES ($1, $2)
        RETURNING parent_id, student_id
        "#,
        input.parent_id,
        input.student_id
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(Json(record))
}

async fn students_for_parent(
    State(pool): State<PgPool>,
    Path(parent_id): Path<Uuid>,
) -> Result<Json<Vec<ParentStudent>>, String> {
    let result = sqlx::query_as!(
        ParentStudent,
        "SELECT parent_id, student_id FROM parent_students WHERE parent_id = $1",
        parent_id
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(Json(result))
}

async fn delete_parent_student(
    State(pool): State<PgPool>,
    Path((parent_id, student_id)): Path<(Uuid, Uuid)>,
) -> Result<StatusCode, (StatusCode, String)> {
    let result = sqlx::query!(
        "DELETE FROM parent_students WHERE parent_id = $1 AND student_id = $2",
        parent_id,
        student_id
    )
    .execute(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Parent-student link not found".into()))
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}


// === Absence handlers ===

async fn create_absence(
    State(pool): State<PgPool>,
    Json(input): Json<NewAbsence>,
) -> Result<Json<Absence>, String> {
    let absence = sqlx::query_as::<_, Absence>(
        r#"
        INSERT INTO absences (student_id, date, reason)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(input.student_id)
    .bind(input.date)
    .bind(input.reason)
    .fetch_one(&pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(Json(absence))
}

async fn list_absences(State(pool): State<PgPool>) -> Result<Json<Vec<Absence>>, String> {
    let absences = sqlx::query_as::<_, Absence>("SELECT * FROM absences")
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(Json(absences))
}

#[derive(Deserialize)]
struct UpdateAbsence {
    date: Option<chrono::NaiveDate>,
    reason: Option<String>,
}

async fn update_absence(
    State(pool): State<PgPool>,
    Path(absence_id): Path<Uuid>,
    Json(input): Json<UpdateAbsence>,
) -> Result<Json<Absence>, (StatusCode, String)> {
    let updated_absence = sqlx::query_as::<_, Absence>(
        r#"
        UPDATE absences
        SET
            date = COALESCE($1, date),
            reason = COALESCE($2, reason)
        WHERE id = $3
        RETURNING *
        "#
    )
    .bind(input.date)
    .bind(input.reason)
    .bind(absence_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;

    Ok(Json(updated_absence))
}

async fn delete_absence(
    State(pool): State<PgPool>,
    Path(absence_id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let result = sqlx::query!("DELETE FROM absences WHERE id = $1", absence_id)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Absence not found".into()))
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}


// === Statistics handlers ===

async fn stats_avg_grade(State(pool): State<PgPool>) -> Result<Json<Vec<StudentAvgGrade>>, String> {
    let rows = sqlx::query_as!(
        StudentAvgGrade,
        r#"
        SELECT student_id, AVG(value)::float8 as avg_grade
        FROM grades
        GROUP BY student_id
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Json(rows))
}

async fn stats_absence_count(State(pool): State<PgPool>) -> Result<Json<Vec<StudentAbsenceCount>>, String> {
    let rows = sqlx::query!(
        r#"
        SELECT student_id, COUNT(*) as "absence_count!"
        FROM absences
        GROUP BY student_id
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| e.to_string())?;

    let stats = rows.into_iter().map(|row| StudentAbsenceCount {
        student_id: row.student_id,
        absence_count: row.absence_count,
    }).collect();

    Ok(Json(stats))
}




// === Main app setup ===

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("Missing DATABASE_URL");
    let pool = PgPool::connect(&database_url).await.expect("Failed DB connection");

    let app = Router::new()
        .route("/health", get(health_check))
        // USERS
        .route("/users", post(create_user).get(list_users))
        .route("/users/:id", put(update_user))
        .route("/users/:id", delete(delete_user))
        // STUDENTS
        .route("/students", post(create_student).get(list_students))
        .route("/students/:id", get(get_student))
        .route("/students/:id", put(update_student))
        .route("/students/:id", delete(delete_student))
        // GRADES
        .route("/grades", post(create_grade).get(list_grades))
        .route("/grades/:id", put(update_grade))
        .route("/grades/:id", delete(delete_grade))
        // PARENT-STUDENT RELATION
        .route("/parent_students", post(link_parent_student))
        .route("/parent_students/:parent_id", get(students_for_parent))
        .route("/parent_students/:parent_id/:student_id", delete(delete_parent_student))
        // ABSENCES
        .route("/absences", post(create_absence).get(list_absences))
        .route("/absences/:id", put(update_absence))
        .route("/absences/:id", delete(delete_absence))
        // STATISTICS
        .route("/stats/avg_grade", get(stats_avg_grade))
        .route("/stats/absence_count", get(stats_absence_count))
        // LOGIN
        .route("/login", post(login))
        .with_state(pool);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running at http://{}", addr);

    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app.into_make_service())
        .await
        .unwrap();
}

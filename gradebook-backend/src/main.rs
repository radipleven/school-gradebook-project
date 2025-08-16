mod db;
mod models;
use axum::extract::FromRef;
use axum::{
    extract::{State, Path, FromRequestParts},
    http::{StatusCode, request::Parts},
    routing::{get, post, put, delete},
    Json, Router,
};
use models::parent_student::{ParentStudent, LinkParentStudent};
use models::grade::{Grade, NewGrade};
use models::absence::{Absence, NewAbsence};
use models::user::{User, Role, NewUser};
use models::student::{Student, NewStudent};
use serde::{Serialize, Deserialize};
use sqlx::PgPool;
use std::net::SocketAddr;
use uuid::Uuid;
use tower_http::cors::{CorsLayer, Any};

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

// === User extraction (Replace with session/JWT auth in production) ===
// Looks for header "x-user-id" and loads user from DB.
#[axum::async_trait]
impl<S> FromRequestParts<S> for User
where
    PgPool: axum::extract::FromRef<S>,
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let user_id = parts
            .headers
            .get("x-user-id")
            .and_then(|v| v.to_str().ok())
            .and_then(|s| Uuid::parse_str(s).ok())
            .ok_or_else(|| (StatusCode::UNAUTHORIZED, "Missing or invalid x-user-id header".to_string()))?;

        let pool = PgPool::from_ref(state);
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(user_id)
            .fetch_one(&pool)
            .await
            .map_err(|_| (StatusCode::UNAUTHORIZED, "User not found".to_string()))?;

        Ok(user)
    }
}

// === Role guard helper ===
fn require_role(user: &User, allowed: &[Role]) -> Result<(), (StatusCode, String)> {
    if allowed.contains(&user.role) {
        Ok(())
    } else {
        Err((StatusCode::FORBIDDEN, format!("Insufficient permissions for role {:?}", user.role)))
    }
}

// === Health check ===
async fn health_check(State(pool): State<PgPool>) -> &'static str {
    if sqlx::query("SELECT 1").execute(&pool).await.is_ok() {
        "DB OK"
    } else {
        "DB ERROR"
    }
}

// === Login handler (public) ===
#[derive(Deserialize)]
struct LoginRequest { email: String, password: String }
#[derive(Serialize)]
struct LoginResponse { user_id: Uuid, role: Role }

async fn login(State(pool): State<PgPool>, Json(input): Json<LoginRequest>)
    -> Result<Json<LoginResponse>, (StatusCode, String)>
{
    let user = sqlx::query_as::<_, User>(
        r#"
        SELECT * FROM users WHERE email = $1 AND hashed_password = crypt($2, hashed_password)
        "#
    )
    .bind(&input.email)
    .bind(&input.password)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        println!("Login error: {:?}", e);
        (StatusCode::UNAUTHORIZED, "Invalid email or password".to_string())
    })?;

    Ok(Json(LoginResponse { user_id: user.id, role: user.role }))
}




async fn create_user(State(pool): State<PgPool>, user: User, Json(input): Json<NewUser>)
    -> Result<Json<User>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin])?;

    let row = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (email, hashed_password, role, first_name, last_name)
        VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5)
        RETURNING *
        "#
    )
    .bind(&input.email)
    .bind(&input.password)
    .bind(&input.role)
    .bind(&input.first_name)
    .bind(&input.last_name)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(row))
}

async fn list_users(State(pool): State<PgPool>, user: User)
    -> Result<Json<Vec<User>>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director])?;
    let users = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(users))
}

#[derive(Deserialize)]
struct UpdateUser {
    email: Option<String>,
    password: Option<String>,
    role: Option<Role>,
    first_name: Option<String>,
    last_name: Option<String>,
}

async fn update_user(State(pool): State<PgPool>, user: User, Path(user_id): Path<Uuid>, Json(input): Json<UpdateUser>)
    -> Result<Json<User>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin])?;

    let updated_user = sqlx::query_as::<_, User>(
        r#"
        UPDATE users
        SET
            email = COALESCE($1, email),
            hashed_password = COALESCE(
                CASE WHEN $2 IS NOT NULL THEN crypt($2, gen_salt('bf')) ELSE NULL END,
                hashed_password
            ),
            role = COALESCE($3, role),
            first_name = COALESCE($4, first_name),
            last_name = COALESCE($5, last_name)
        WHERE id = $6
        RETURNING *
        "#
    )
    .bind(input.email)
    .bind(input.password)
    .bind(input.role)
    .bind(input.first_name)
    .bind(input.last_name)
    .bind(user_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;

    Ok(Json(updated_user))
}


async fn delete_user(State(pool): State<PgPool>, user: User, Path(user_id): Path<Uuid>)
    -> Result<StatusCode, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin])?;
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

// === RBAC: ADMIN + Director ===
async fn create_student(State(pool): State<PgPool>, user: User, Json(input): Json<NewStudent>)
    -> Result<Json<Student>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director])?;
    let student = sqlx::query_as::<_, Student>(
        r#"INSERT INTO students (user_id, class) VALUES ($1, $2) RETURNING *"#)
        .bind(input.user_id)
        .bind(input.class)
        .fetch_one(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(student))
}

async fn delete_student(State(pool): State<PgPool>, user: User, Path(student_id): Path<Uuid>)
    -> Result<StatusCode, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director])?;
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

async fn list_students(State(pool): State<PgPool>, user: User)
    -> Result<Json<Vec<Student>>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher, Role::Parent, Role::Student])?;
    let students = sqlx::query_as::<_, Student>(
        r#"
        SELECT s.id, s.user_id, s.class, s.created_at,
               u.first_name, u.last_name, u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(students))
}

async fn get_student(State(pool): State<PgPool>, user: User, Path(student_id): Path<Uuid>)
    -> Result<Json<Student>, (StatusCode, String)>
{
    // Directors, Teachers (for their students), Parents (for their children), Students (for self)
    // Simplified: allow all, restrict in prod!
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher, Role::Parent, Role::Student])?;
    let student = sqlx::query_as::<_, Student>(
        r#"
        SELECT s.id, s.user_id, s.class, s.created_at,
               u.first_name, u.last_name, u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = $1
        "#
    )
    .bind(student_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;
    Ok(Json(student))
}

#[derive(Deserialize)]
struct UpdateStudent { class: Option<String> }

async fn update_student(State(pool): State<PgPool>, user: User, Path(student_id): Path<Uuid>, Json(input): Json<UpdateStudent>)
    -> Result<Json<Student>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director])?;
    let updated_student = sqlx::query_as::<_, Student>(
        r#"UPDATE students SET class = COALESCE($1, class) WHERE id = $2 RETURNING *"#)
        .bind(input.class)
        .bind(student_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;
    Ok(Json(updated_student))
}

// === GRADES: Teachers (for their students), Admin, Director ===
async fn create_grade(State(pool): State<PgPool>, user: User, Json(input): Json<NewGrade>)
    -> Result<Json<Grade>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher])?;
    // TODO: Further restrict teachers to their students
    let grade = sqlx::query_as::<_, Grade>(
        r#"INSERT INTO grades (student_id, subject, value, teacher_id) VALUES ($1, $2, $3, $4) RETURNING *"#)
        .bind(input.student_id)
        .bind(&input.subject)
        .bind(input.value)
        .bind(input.teacher_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(grade))
}

#[derive(Deserialize)]
struct UpdateGrade { value: Option<i16>, subject: Option<String> }

async fn update_grade(State(pool): State<PgPool>, user: User, Path(grade_id): Path<Uuid>, Json(input): Json<UpdateGrade>)
    -> Result<Json<Grade>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher])?;
    // TODO: Restrict teachers to grades they own
    let updated_grade = sqlx::query_as::<_, Grade>(
        r#"
        UPDATE grades
        SET value = COALESCE($1, value), subject = COALESCE($2, subject)
        WHERE id = $3
        RETURNING *
        "#)
        .bind(input.value)
        .bind(input.subject)
        .bind(grade_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;
    Ok(Json(updated_grade))
}

async fn delete_grade(State(pool): State<PgPool>, user: User, Path(grade_id): Path<Uuid>)
    -> Result<StatusCode, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher])?;
    // TODO: Restrict teachers to grades they own
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

async fn list_grades(State(pool): State<PgPool>, user: User)
    -> Result<Json<Vec<Grade>>, (StatusCode, String)>
{
    use Role::*;

    match user.role {
        Admin | Director | Teacher => {
            // Full access: return all grades
            let grades = sqlx::query_as::<_, Grade>("SELECT * FROM grades")
                .fetch_all(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            Ok(Json(grades))
        }
        Parent => {
            // Only grades for this parent's children
            let student_ids = sqlx::query!(
                "SELECT student_id FROM parent_students WHERE parent_id = $1",
                user.id
            )
            .fetch_all(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            // If parent has no children, return empty
            if student_ids.is_empty() {
                return Ok(Json(vec![]));
            }

            // Collect UUIDs of children
            let ids: Vec<Uuid> = student_ids.into_iter().map(|rec| rec.student_id).collect();

            // Use SQL's ANY for matching student_id in the list
            let grades = sqlx::query_as::<_, Grade>(
                "SELECT * FROM grades WHERE student_id = ANY($1)"
            )
            .bind(&ids)
            .fetch_all(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            Ok(Json(grades))
        }
        Student => {
            // Only grades for this student
            // First, find the student_id for this user
            let rec = sqlx::query!(
                "SELECT id FROM students WHERE user_id = $1",
                user.id
            )
            .fetch_optional(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            if let Some(student) = rec {
                let grades = sqlx::query_as::<_, Grade>(
                    "SELECT * FROM grades WHERE student_id = $1"
                )
                .bind(student.id)
                .fetch_all(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                Ok(Json(grades))
            } else {
                // This user is not linked to any student record
                Ok(Json(vec![]))
            }
        }
    }
}


// === Parent-Student relation: Admin/Director only ===
async fn link_parent_student(State(pool): State<PgPool>, user: User, Json(input): Json<LinkParentStudent>)
    -> Result<Json<ParentStudent>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director])?;
    let record = sqlx::query_as!(
        ParentStudent,
        r#"INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) RETURNING parent_id, student_id"#,
        input.parent_id, input.student_id
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(record))
}

// Parents: view their own children
async fn students_for_parent(State(pool): State<PgPool>, user: User, Path(parent_id): Path<Uuid>)
    -> Result<Json<Vec<ParentStudent>>, (StatusCode, String)>
{
    if user.role != Role::Parent && user.role != Role::Admin && user.role != Role::Director {
        return Err((StatusCode::FORBIDDEN, "Insufficient permissions".to_string()));
    }
    // Parents can only access their own record
    if user.role == Role::Parent && parent_id != user.id {
        return Err((StatusCode::FORBIDDEN, "Parents can only access their own children".to_string()));
    }
    let result = sqlx::query_as!(
        ParentStudent,
        "SELECT parent_id, student_id FROM parent_students WHERE parent_id = $1",
        parent_id
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(result))
}

async fn delete_parent_student(State(pool): State<PgPool>, user: User, Path((parent_id, student_id)): Path<(Uuid, Uuid)>)
    -> Result<StatusCode, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director])?;
    let result = sqlx::query!(
        "DELETE FROM parent_students WHERE parent_id = $1 AND student_id = $2",
        parent_id, student_id
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

// === Absence handlers: Teachers/Admin/Director ===
async fn create_absence(State(pool): State<PgPool>, user: User, Json(input): Json<NewAbsence>)
    -> Result<Json<Absence>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher])?;
    let absence = sqlx::query_as::<_, Absence>(
        r#"INSERT INTO absences (student_id, date, reason) VALUES ($1, $2, $3) RETURNING *"#)
        .bind(input.student_id)
        .bind(input.date)
        .bind(input.reason)
        .fetch_one(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(absence))
}

async fn list_absences(State(pool): State<PgPool>, user: User)
    -> Result<Json<Vec<Absence>>, (StatusCode, String)>
{
    use Role::*;

    match user.role {
        Admin | Director | Teacher => {
            // See all absences
            let absences = sqlx::query_as::<_, Absence>("SELECT * FROM absences")
                .fetch_all(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            Ok(Json(absences))
        }
        Parent => {
            // Only absences for this parent's children
            let student_ids = sqlx::query!(
                "SELECT student_id FROM parent_students WHERE parent_id = $1",
                user.id
            )
            .fetch_all(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            if student_ids.is_empty() {
                return Ok(Json(vec![]));
            }

            let ids: Vec<Uuid> = student_ids.into_iter().map(|rec| rec.student_id).collect();

            let absences = sqlx::query_as::<_, Absence>(
                "SELECT * FROM absences WHERE student_id = ANY($1)"
            )
            .bind(&ids)
            .fetch_all(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            Ok(Json(absences))
        }
        Student => {
            // Only absences for this student
            let rec = sqlx::query!(
                "SELECT id FROM students WHERE user_id = $1",
                user.id
            )
            .fetch_optional(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            if let Some(student) = rec {
                let absences = sqlx::query_as::<_, Absence>(
                    "SELECT * FROM absences WHERE student_id = $1"
                )
                .bind(student.id)
                .fetch_all(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                Ok(Json(absences))
            } else {
                Ok(Json(vec![]))
            }
        }
    }
}


#[derive(Deserialize)]
struct UpdateAbsence { date: Option<chrono::NaiveDate>, reason: Option<String> }

async fn update_absence(State(pool): State<PgPool>, user: User, Path(absence_id): Path<Uuid>, Json(input): Json<UpdateAbsence>)
    -> Result<Json<Absence>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher])?;
    let updated_absence = sqlx::query_as::<_, Absence>(
        r#"UPDATE absences SET date = COALESCE($1, date), reason = COALESCE($2, reason) WHERE id = $3 RETURNING *"#)
        .bind(input.date)
        .bind(input.reason)
        .bind(absence_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))?;
    Ok(Json(updated_absence))
}

async fn delete_absence(State(pool): State<PgPool>, user: User, Path(absence_id): Path<Uuid>)
    -> Result<StatusCode, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher])?;
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

// === Statistics: Directors/Admin only ===
async fn stats_avg_grade(State(pool): State<PgPool>, user: User)
    -> Result<Json<Vec<StudentAvgGrade>>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher, Role::Parent, Role::Student])?;
    let rows = sqlx::query_as!(
        StudentAvgGrade,
        r#"SELECT student_id, AVG(value)::float8 as avg_grade FROM grades GROUP BY student_id"#
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(rows))
}

async fn stats_absence_count(State(pool): State<PgPool>, user: User)
    -> Result<Json<Vec<StudentAbsenceCount>>, (StatusCode, String)>
{
    require_role(&user, &[Role::Admin, Role::Director, Role::Teacher, Role::Parent, Role::Student])?;
    let rows = sqlx::query!(
        r#"SELECT student_id, COUNT(*) as "absence_count!" FROM absences GROUP BY student_id"#
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
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

    let cors = CorsLayer::new()
    .allow_origin(Any)           // Allow all origins; for production, specify your frontend origin
    .allow_methods(Any)          // Allow all HTTP methods (GET, POST, etc.)
    .allow_headers(Any);

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
        // LOGIN (public)
        .route("/login", post(login))
        .layer(cors) 
        .with_state(pool);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running at http://{}", addr);

    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app.into_make_service())
        .await
        .unwrap();
}

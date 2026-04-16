CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE workouts (
    workout_id SERIAL PRIMARY KEY,
    user_id INT,
    workout_date DATE,
    workout_type VARCHAR(100),
    duration_minutes INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE TABLE exercises (
    exercise_id SERIAL PRIMARY KEY,
    workout_id INT,
    exercise_name VARCHAR(100),
    sets INT,
    reps INT,
    weight DECIMAL(5,2),
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
);

CREATE TABLE goals (
    goal_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    goal_title VARCHAR(140) NOT NULL,
    target_workouts_per_week INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
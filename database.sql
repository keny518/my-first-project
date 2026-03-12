-- Create a new database named "Workout"
-- and set its owner to "kenny"
CREATE DATABASE "Workout" OWNER TO kenny;

-- Create a table named "users" to store user information
-- with columns for user_id, name, email, and password
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(250)
);

-- Create a table named "workouts" to store workout information
-- with columns for workout_id, user_id, workout_date, workout_type, and duration_minutes
CREATE TABLE workouts (
    workout_id SERIAL PRIMARY KEY,
    user_id INT,
    workout_date DATE,
    workout_type VARCHAR(100),
    duration_minutes INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create a table named "exercises" to store exercise information
-- with columns for exercise_id, workout_id, exercise_name, sets, reps, and weight
CREATE TABLE exercises (
    exercise_id SERIAL PRIMARY KEY,
    workout_id INT,
    exercise_name VARCHAR(100),
    sets INT,
    reps INT,
    weight DECIMAL(5,2),
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
);
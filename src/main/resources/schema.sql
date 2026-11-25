CREATE TABLE IF NOT EXISTS patients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 0 AND 120),
  gender TEXT NOT NULL,
  ward TEXT NOT NULL,
  department TEXT NOT NULL,
  doctor TEXT NOT NULL,
  admission_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Admitted','Discharged'))
);

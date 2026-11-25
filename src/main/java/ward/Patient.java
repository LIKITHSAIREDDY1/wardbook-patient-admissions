package ward;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

public record Patient(String name, Integer age, String gender, String ward,
                      String department, String doctor, LocalDate admissionDate, String status) {
    static final Map<String, List<String>> OPTIONS = Map.of(
        "gender", List.of("Female", "Male", "Other"),
        "ward", List.of("General", "Private", "Intensive Care"),
        "department", List.of("General Medicine", "Cardiology", "Orthopedics", "Pediatrics"),
        "doctor", List.of("Dr. Rao", "Dr. Shah", "Dr. Roy"),
        "status", List.of("Admitted", "Discharged")
    );

    void validate() {
        if (name == null || !name.matches("[\\p{L}][\\p{L}\\p{M}]*( [\\p{L}][\\p{L}\\p{M}]*)*"))
            throw new IllegalArgumentException("Enter a name using letters and spaces.");
        if (age == null || age < 0 || age > 120)
            throw new IllegalArgumentException("Age must be a whole number from 0 to 120.");
        checkChoice("gender", gender);
        checkChoice("ward", ward);
        checkChoice("department", department);
        checkChoice("doctor", doctor);
        checkChoice("status", status);
        if (admissionDate == null || admissionDate.isAfter(LocalDate.now(ZoneId.of("Asia/Kolkata"))))
            throw new IllegalArgumentException("Choose an admission date on or before today (IST).");
    }

    private void checkChoice(String field, String value) {
        if (value == null || !OPTIONS.get(field).contains(value))
            throw new IllegalArgumentException("Choose a valid " + field + ".");
    }
}

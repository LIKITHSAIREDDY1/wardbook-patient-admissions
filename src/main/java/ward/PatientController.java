package ward;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class PatientController {
    private final JdbcTemplate db;

    public PatientController(JdbcTemplate db) { this.db = db; }

    @GetMapping("/options")
    public Map<String, List<String>> options() { return Patient.OPTIONS; }

    @GetMapping("/patients")
    public List<Map<String, Object>> list() {
        return db.queryForList("""
            SELECT id, name, age, gender, ward, department, doctor,
                   admission_date AS "admissionDate", status
            FROM patients ORDER BY admission_date DESC, id DESC
            """);
    }

    @PostMapping("/patients")
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@RequestBody Patient p) {
        p.validate();
        db.update("""
            INSERT INTO patients(name,age,gender,ward,department,doctor,admission_date,status)
            VALUES (?,?,?,?,?,?,?,?)
            """, p.name(), p.age(), p.gender(), p.ward(), p.department(), p.doctor(), p.admissionDate(), p.status());
    }

    @PutMapping("/patients/{id}")
    public void edit(@PathVariable long id, @RequestBody Patient p) {
        p.validate();
        requireRow(db.update("""
            UPDATE patients SET name=?,age=?,gender=?,ward=?,department=?,doctor=?,admission_date=?,status=?
            WHERE id=?
            """, p.name(), p.age(), p.gender(), p.ward(), p.department(), p.doctor(), p.admissionDate(), p.status(), id));
    }

    @PatchMapping("/patients/{id}/discharge")
    public void discharge(@PathVariable long id) {
        requireRow(db.update("UPDATE patients SET status='Discharged' WHERE id=?", id));
    }

    @DeleteMapping("/patients/{id}")
    public void delete(@PathVariable long id) {
        requireRow(db.update("DELETE FROM patients WHERE id=?", id));
    }

    private void requireRow(int count) {
        if (count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient no longer exists.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String,String> invalid(IllegalArgumentException ex) { return Map.of("message", ex.getMessage()); }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String,String> unreadable() {
        return Map.of("message", "Check the patient fields. Use a whole number for age and YYYY-MM-DD for admission date.");
    }
}

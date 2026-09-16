package com.example.school.system.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TeacherRemarkSchemaInitializer implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute(
                "ALTER TABLE teacher_remarks MODIFY COLUMN teacher_id BINARY(16) NULL");
        Integer smsIndex = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                  AND table_name = 'result_sms_notifications'
                  AND index_name = 'uk_result_sms_publication'
                """,
                Integer.class);
        if (smsIndex != null && smsIndex > 0) {
            Integer studentIndex = jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*)
                    FROM information_schema.statistics
                    WHERE table_schema = DATABASE()
                      AND table_name = 'result_sms_notifications'
                      AND index_name = 'idx_result_sms_student'
                    """,
                    Integer.class);
            if (studentIndex == null || studentIndex == 0) {
                jdbcTemplate.execute(
                        "ALTER TABLE result_sms_notifications ADD INDEX idx_result_sms_student (student_id)");
            }
            jdbcTemplate.execute(
                    "ALTER TABLE result_sms_notifications DROP INDEX uk_result_sms_publication");
        }
    }
}

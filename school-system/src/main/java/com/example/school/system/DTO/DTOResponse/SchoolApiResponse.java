package com.example.school.system.DTO.DTOResponse;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SchoolApiResponse<T> {
    private String status;
    private T data;
    private String message;
    private String timeStamp;

    private SchoolApiResponse(
            String status,
            T data,
            String message,
            String timeStamp) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.timeStamp = timeStamp;
    }

    public static <T> SchoolApiResponse<T> success(String status, T data, String message) {
        return new SchoolApiResponse<>(status, data, message, Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> success(String status, String message) {
        return new SchoolApiResponse<>(status, null, message, Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> success(String status) {
        return new SchoolApiResponse<>("Success", null, null, Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> success() {
        return new SchoolApiResponse<>("Success", null, null, Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> error(String status, String message, String timeStamp) {
        return new SchoolApiResponse<>(status, null, message, Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> error() {
        return new SchoolApiResponse<>("Error", null, null, Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> error(String message) {
        return new SchoolApiResponse<>("Error", null, message, Instant.now().toString());
    }

}

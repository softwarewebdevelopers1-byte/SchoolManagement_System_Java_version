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

    private SchoolApiResponse(
            String status,
            String message,
            String timeStamp) {
        this.status = status;
        this.message = message;
        this.timeStamp = timeStamp;
    }

    private SchoolApiResponse(
            String status,
            T data,
            String timeStamp) {
        this.status = status;
        this.data = data;
        this.timeStamp = timeStamp;
    }

    private SchoolApiResponse(
            String status,
            String timeStamp) {
        this.status = status;
        this.timeStamp = timeStamp;
    }

    private SchoolApiResponse(
            String status) {
        this.status = status;
    }

    static private String SuccessMessage() {
        return "Success";
    }

    static private String ErrorMessage() {
        return "Error";
    }

    public static <T> SchoolApiResponse<T> success(T data, String message) {
        return new SchoolApiResponse<>(SuccessMessage(), data, message, Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> success(String message) {
        return new SchoolApiResponse<>(SuccessMessage(), message, Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> success() {
        return new SchoolApiResponse<>(SuccessMessage(), Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> error() {
        return new SchoolApiResponse<>(ErrorMessage(), Instant.now().toString());
    }

    public static <T> SchoolApiResponse<T> error(String message) {
        return new SchoolApiResponse<>(ErrorMessage(), message, Instant.now().toString());
    }

}

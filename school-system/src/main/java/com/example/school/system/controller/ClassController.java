package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class ClassController {
    @PostMapping("/create-class")
    public String postMethodName(@RequestBody String entity) {
        

        return entity;
    }

}

package com.pawtrolai.pawtrol_ai_backend.controller;

import org.springframework.web.bind.annotation.GetMapping; 
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Arrays;

@RestController
public class AnimalController 
{
    @GetMapping("/animals")
    public List<String> getAnimals()
     {
        return Arrays.asList("Dog", "Cat", "Bird", "Goat");
    }
}
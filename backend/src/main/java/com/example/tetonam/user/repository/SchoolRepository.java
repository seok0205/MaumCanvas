package com.example.tetonam.user.repository;

import com.example.tetonam.user.domain.School;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchoolRepository extends JpaRepository<School,String> {

    List<School> findByNameContaining(String name);
}

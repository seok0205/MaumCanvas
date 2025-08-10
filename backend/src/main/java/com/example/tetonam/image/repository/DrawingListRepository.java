package com.example.tetonam.image.repository;

import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DrawingListRepository extends JpaRepository<DrawingList,Long> {


    Optional<DrawingList> findFirstByUserOrderByCreatedDateDesc(User user);
}


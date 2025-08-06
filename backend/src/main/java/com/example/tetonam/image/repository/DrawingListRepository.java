package com.example.tetonam.image.repository;

import com.example.tetonam.image.domain.Drawing;
import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DrawingListRepository extends JpaRepository<DrawingList,Long> {


    @Query("SELECT d FROM DrawingList d WHERE d.user = :user ORDER BY d.createdDate DESC")
    Optional<DrawingList> findLatestByUser(User user);
}


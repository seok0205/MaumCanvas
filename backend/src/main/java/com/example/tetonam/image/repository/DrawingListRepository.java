package com.example.tetonam.image.repository;

import com.example.tetonam.image.domain.Drawing;
import com.example.tetonam.image.domain.DrawingList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DrawingListRepository extends JpaRepository<DrawingList,Long> {


}


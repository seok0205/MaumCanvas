package com.example.tetonam.community.domain;

public enum Category {
    GENERAL("일반"),
    STUDY("학업"),
    FRIENDSHIP("친구관계"),
    FAMILY("가족"),
    REVIEW("상담후기");

    private final String description;

    Category(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
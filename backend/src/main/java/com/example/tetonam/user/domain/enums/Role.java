package com.example.tetonam.user.domain.enums;

public enum Role {
  ADMIN("ROLE_ADMIN"),
  USER("ROLE_USER");

  private final String roleName;

  Role(String roleName) {
    this.roleName = roleName;
  }

  public String getRoleName() {
    return roleName;
  }
}

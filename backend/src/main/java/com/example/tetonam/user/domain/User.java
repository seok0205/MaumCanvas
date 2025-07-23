package com.example.tetonam.user.domain;


import com.example.tetonam.user.domain.enums.Gender;
import com.example.tetonam.user.domain.enums.Role;
import com.example.tetonam.util.BaseTime;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class User extends BaseTime implements UserDetails {
  @Id
  @GeneratedValue
  @Column(name = "user_id", updatable = false, unique = true, nullable = false)
  private Long id;

  @Column(nullable = false)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private String nickname;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private Gender gender; // 성별

  @Column(nullable = false)
  private String phone; // 휴대폰

  @JoinColumn(name="school_name")
  @ManyToOne
  private School school; // 학교

  @Column(nullable = false)
  private String birthday; // 생일

  @ElementCollection(fetch = FetchType.EAGER)
  @Builder.Default
  @Enumerated(EnumType.STRING) // Enum을 문자열로 저장
  private List<Role> roles = new ArrayList<>();
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return this.roles.stream()
        .map(role -> new SimpleGrantedAuthority(role.getRoleName()))
        .collect(Collectors.toList());
  }

  @Override
  public String getUsername() {
    return this.email;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }

}

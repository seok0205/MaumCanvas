package com.example.tetonam.exception.handler;


import com.example.tetonam.exception.GeneralException;
import com.example.tetonam.response.code.BaseErrorCode;

public class TokenHandler extends GeneralException {
  public TokenHandler(BaseErrorCode errorCode) {
    super(errorCode);
  }
}

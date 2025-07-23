package com.example.tetonam.exception.handler;


import com.example.tetonam.exception.GeneralException;
import com.example.tetonam.response.code.BaseErrorCode;

public class MailHandler extends GeneralException {
  public MailHandler(BaseErrorCode errorCode) {
    super(errorCode);
  }
}

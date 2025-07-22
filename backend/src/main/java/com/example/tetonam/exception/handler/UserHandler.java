package com.example.tetonam.exception.handler;


import com.example.tetonam.exception.GeneralException;
import com.example.tetonam.response.code.BaseErrorCode;

public class UserHandler extends GeneralException {

    public UserHandler(BaseErrorCode errorCode) {
        super(errorCode);
    }
}

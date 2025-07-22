package com.example.tetonam.exception.handler;


import com.example.tetonam.exception.GeneralException;
import com.example.tetonam.response.code.BaseErrorCode;

public class BoardHandler extends GeneralException {

    public BoardHandler(BaseErrorCode errorCode) {
        super(errorCode);
    }
}
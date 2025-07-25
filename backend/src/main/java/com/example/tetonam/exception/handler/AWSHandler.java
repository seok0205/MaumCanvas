package com.example.tetonam.exception.handler;


import com.example.tetonam.exception.GeneralException;
import com.example.tetonam.response.code.BaseErrorCode;

public class AWSHandler extends GeneralException {

    public AWSHandler(BaseErrorCode errorCode) {
        super(errorCode);
    }
}
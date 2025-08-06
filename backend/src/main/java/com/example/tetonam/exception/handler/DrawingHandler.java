package com.example.tetonam.exception.handler;


import com.example.tetonam.exception.GeneralException;
import com.example.tetonam.response.code.BaseErrorCode;

public class DrawingHandler extends GeneralException {

    public DrawingHandler(BaseErrorCode errorCode) {
        super(errorCode);
    }
}
package com.example.tetonam.agora.token.util;

public interface PackableEx extends Packable {
    void unmarshal(ByteBuf in);
}

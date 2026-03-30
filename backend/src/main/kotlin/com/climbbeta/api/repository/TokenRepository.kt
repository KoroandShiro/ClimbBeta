package com.climbbeta.api.repository

import com.climbbeta.api.domain.Token

interface TokenRepository {
    fun createToken(token: Token)

    fun getTokenByHash(tokenHash: String): Token?
}
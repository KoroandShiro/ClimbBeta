package com.climbbeta.api.repository

import com.climbbeta.api.domain.Token

interface TokenRepository {
    /** Persists a new session token. The raw value carried in [Token.tokenHash] is hashed at rest. */
    fun createToken(token: Token)

    /** Returns the token only if it exists AND has not expired. Hashes the input before looking it up. */
    fun getTokenByHash(tokenHash: String): Token?

    /** Revokes a token (server-side logout). No-op if it does not exist. */
    fun deleteToken(tokenHash: String)
}

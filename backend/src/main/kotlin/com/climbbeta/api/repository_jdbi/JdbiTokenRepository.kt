package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Token
import com.climbbeta.api.repository.TokenRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

/**
 * JDBI implementation of the [TokenRepository].
 *
 * Persists and validates cryptographic authentication session hashes mapped against active users.
 */
@Repository
class JdbiTokenRepository(private val jdbi: Jdbi) : TokenRepository {

    override fun createToken(token: Token) {
        jdbi.withHandle<Unit, Exception> { handle ->
            handle.createUpdate(
                """
                INSERT INTO tokens (token_hash, user_id) 
                VALUES (:tokenHash, :userId)
                """
            )
                .bind("tokenHash", token.tokenHash)
                .bind("userId", token.userId)
                .execute()
        }
    }

    override fun getTokenByHash(tokenHash: String): Token? {
        return jdbi.withHandle<Token?, Exception> { handle ->
            handle.createQuery("SELECT token_hash AS tokenHash, user_id AS userId, created_at AS createdAt, last_used_at AS lastUsedAt FROM tokens WHERE token_hash = :hash")
                .bind("hash", tokenHash)
                .mapTo(Token::class.java)
                .findOne()
                .orElse(null)
        }
    }
}
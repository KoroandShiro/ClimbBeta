package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Token
import com.climbbeta.api.repository.TokenRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository
import java.security.MessageDigest

/**
 * JDBI implementation of [TokenRepository].
 *
 * Security properties of the opaque session tokens:
 *  - Stored HASHED (SHA-256), never in the clear: a database dump does not expose reusable tokens.
 *    The raw token only ever lives on the client.
 *  - EXPIRE: a token older than [TOKEN_TTL_DAYS] days is treated as invalid (checked in the lookup).
 *  - REVOCABLE: [deleteToken] removes it, so logout invalidates the session server-side.
 */
@Repository
class JdbiTokenRepository(private val jdbi: Jdbi) : TokenRepository {

    override fun createToken(token: Token) {
        jdbi.withHandle<Unit, Exception> { handle ->
            handle.createUpdate(
                "INSERT INTO tokens (token_hash, user_id) VALUES (:tokenHash, :userId)"
            )
                .bind("tokenHash", hash(token.tokenHash))
                .bind("userId", token.userId)
                .execute()
        }
    }

    override fun getTokenByHash(tokenHash: String): Token? {
        return jdbi.withHandle<Token?, Exception> { handle ->
            handle.createQuery(
                """
                SELECT token_hash AS tokenHash, user_id AS userId, created_at AS createdAt, last_used_at AS lastUsedAt
                FROM tokens
                WHERE token_hash = :hash AND created_at > now() - INTERVAL '$TOKEN_TTL_DAYS days'
                """
            )
                .bind("hash", hash(tokenHash))
                .mapTo(Token::class.java)
                .findOne()
                .orElse(null)
        }
    }

    override fun deleteToken(tokenHash: String) {
        jdbi.withHandle<Unit, Exception> { handle ->
            handle.createUpdate("DELETE FROM tokens WHERE token_hash = :hash")
                .bind("hash", hash(tokenHash))
                .execute()
        }
    }

    /**
     * SHA-256 hex of the raw token. Tokens are high-entropy random UUIDs, so a fast hash is the
     * right tool here (unlike passwords, which need a deliberately slow hash like BCrypt).
     */
    private fun hash(raw: String): String =
        MessageDigest.getInstance("SHA-256")
            .digest(raw.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }

    private companion object {
        const val TOKEN_TTL_DAYS = 30
    }
}

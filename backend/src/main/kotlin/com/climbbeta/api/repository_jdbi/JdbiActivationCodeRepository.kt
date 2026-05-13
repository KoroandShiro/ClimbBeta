package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.ActivationCode
import com.climbbeta.api.repository.ActivationCodeRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

@Repository
class JdbiActivationCodeRepository(private val jdbi: Jdbi) : ActivationCodeRepository {

    override fun createCode(code: String): ActivationCode {
        return jdbi.withHandle<ActivationCode, Exception> { handle ->
            handle.createUpdate(
                "INSERT INTO activation_codes (code) VALUES (:code)"
            )
                .bind("code", code)
                .execute()

            handle.createQuery(
                "SELECT code, is_used AS isUsed, created_at AS createdAt, used_by AS usedBy FROM activation_codes WHERE code = :code"
            )
                .bind("code", code)
                .mapTo(ActivationCode::class.java)
                .one()
        }
    }

    override fun getByCode(code: String): ActivationCode? {
        return jdbi.withHandle<ActivationCode?, Exception> { handle ->
            handle.createQuery(
                "SELECT code, is_used AS isUsed, created_at AS createdAt, used_by AS usedBy FROM activation_codes WHERE code = :code"
            )
                .bind("code", code)
                .mapTo(ActivationCode::class.java)
                .findOne()
                .orElse(null)
        }
    }

    override fun markAsUsed(code: String, userId: Int) {
        jdbi.withHandle<Unit, Exception> { handle ->
            handle.createUpdate(
                "UPDATE activation_codes SET is_used = TRUE, used_by = :userId WHERE code = :code"
            )
                .bind("userId", userId)
                .bind("code", code)
                .execute()
        }
    }

    override fun getAllCodes(): List<ActivationCode> {
        return jdbi.withHandle<List<ActivationCode>, Exception> { handle ->
            handle.createQuery(
                "SELECT code, is_used AS isUsed, created_at AS createdAt, used_by AS usedBy FROM activation_codes ORDER BY created_at DESC"
            )
                .mapTo(ActivationCode::class.java)
                .list()
        }
    }
}

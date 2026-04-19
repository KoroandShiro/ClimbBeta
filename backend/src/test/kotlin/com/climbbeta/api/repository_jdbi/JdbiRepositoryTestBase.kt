package com.climbbeta.api.repository_jdbi

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.postgres.PostgresPlugin
import org.junit.jupiter.api.BeforeEach

abstract class JdbiRepositoryTestBase {

    protected val jdbi: Jdbi = createJdbi()

    @BeforeEach
    fun cleanDatabase() {
        jdbi.useHandle<Exception> { h ->
            h.execute(
                """
                TRUNCATE TABLE
                    tokens,
                    boulders,
                    gyms,
                    gym_owner_profiles,
                    climber_profiles,
                    users
                RESTART IDENTITY CASCADE
                """.trimIndent()
            )
        }
    }

    private fun createJdbi(): Jdbi {
        val url = System.getenv("JDBC_DATABASE_URL") ?: "jdbc:postgresql://127.0.0.1:5432/climbbeta_db"
        val user = System.getenv("JDBC_DATABASE_USERNAME") ?: "postgres"
        val password = System.getenv("JDBC_DATABASE_PASSWORD") ?: "1234"

        return Jdbi.create(url, user, password)
            .installPlugin(PostgresPlugin())
            .installPlugin(KotlinPlugin())
    }
}

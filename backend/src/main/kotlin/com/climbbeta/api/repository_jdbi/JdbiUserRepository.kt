package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.User
import com.climbbeta.api.repository.UserRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

@Repository
class JdbiUserRepository(private val jdbi: Jdbi) : UserRepository {

    override fun existsByEmail(email: String): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            handle.createQuery("SELECT COUNT(*) FROM users WHERE email = :email")
                .bind("email", email)
                .mapTo(Int::class.java)
                .one() > 0
        }
    }

    override fun existsByUsername(username: String): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            handle.createQuery("SELECT COUNT(*) FROM users WHERE username = :username")
                .bind("username", username)
                .mapTo(Int::class.java)
                .one() > 0
        }
    }

    override fun createUser(user: User): User {
        return jdbi.withHandle<User, Exception> { handle ->
            // Fazemos o INSERT e pedimos ao Postgres para devolver o ID gerado!
            val generatedId = handle.createUpdate(
                """
                INSERT INTO users (username, email, password_hash, role) 
                VALUES (:username, :email, :passwordHash, :role::user_role)
                """
            )
                .bind("username", user.username)
                .bind("email", user.email)
                .bind("passwordHash", user.passwordHash)
                .bind("role", user.role.name)
                .executeAndReturnGeneratedKeys("id")
                .mapTo(Int::class.java)
                .one()

            // Devolvemos uma cópia do User original mas agora com o ID verdadeiro
            user.copy(id = generatedId)
        }
    }

    override fun getUserByEmail(email: String): User? {
        return jdbi.withHandle<User?, Exception> { handle ->
            handle.createQuery(
                """
            SELECT id, username, email, password_hash AS passwordHash, role, created_at AS createdAt 
            FROM users 
            WHERE email = :email
            """
            )
                .bind("email", email)
                .mapTo(User::class.java)
                .findOne()
                .orElse(null) // Devolve null se não encontrar nenhum user com esse email
        }
    }

    override fun getUserById(id: Int): User? {
        return jdbi.withHandle<User?, Exception> { handle ->
            handle.createQuery(
                """
            SELECT id, username, email, password_hash AS passwordHash, role, created_at AS createdAt 
            FROM users 
            WHERE id = :id
            """
            )
                .bind("id", id)
                .mapTo(User::class.java)
                .findOne()
                .orElse(null)
        }
    }
}
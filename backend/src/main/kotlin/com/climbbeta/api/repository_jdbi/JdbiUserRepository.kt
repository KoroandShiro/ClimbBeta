package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserStatus
import com.climbbeta.api.repository.UserRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

/**
 * JDBI implementation of the [UserRepository].
 *
 * The foundational authority record engine managing system authentication mappings,
 * identity verifications, user discovery searches, and multi-profile role orchestration.
 */
@Repository
class JdbiUserRepository(private val jdbi: Jdbi) : UserRepository {

    /**
     * Internal database layout record for packing optimized network search queries.
     */
    data class UserSearchDbModel(
        val id: Int,
        val username: String,
        val avatarUrl: String?,
        val isFollowing: Boolean
    )

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

    /**
     * Registers identity profiles on Postgres and cascades downstream transactional mappings.
     * * **Side-effects:** Forks initialization sequences creating a generic base profile inside
     * `climber_profiles` or `gym_owner_profiles` matching the assigned corporate permission scope.
     */
    override fun createUser(user: User): User {
        return jdbi.withHandle<User, Exception> { handle ->
            val generatedId = handle.createUpdate(
                """
                INSERT INTO users (username, email, password_hash, role, status)
                VALUES (:username, :email, :passwordHash, :role::user_role, :status::user_status)
                """
            )
                .bind("username", user.username)
                .bind("email", user.email)
                .bind("passwordHash", user.passwordHash)
                .bind("role", user.role.name)
                .bind("status", user.status.name)
                .executeAndReturnGeneratedKeys("id")
                .mapTo(Int::class.java)
                .one()

            if (user.role == com.climbbeta.api.domain.UserRole.CLIMBER) {
                handle.createUpdate("INSERT INTO climber_profiles (user_id) VALUES (:id)")
                    .bind("id", generatedId)
                    .execute()
            } else if (user.role == com.climbbeta.api.domain.UserRole.GYM_OWNER) {
                handle.createUpdate("INSERT INTO gym_owner_profiles (user_id, company_name) VALUES (:id, :companyName)")
                    .bind("id", generatedId)
                    .bind("companyName", "Nome da Empresa (Por preencher)")
                    .execute()
            }

            user.copy(id = generatedId)
        }
    }

    override fun getUserByEmail(email: String): User? {
        return jdbi.withHandle<User?, Exception> { handle ->
            handle.createQuery(
                """
                SELECT id, username, email, password_hash AS passwordHash, role, status, created_at AS createdAt
                FROM users
                WHERE email = :email
                """
            )
                .bind("email", email)
                .mapTo(User::class.java)
                .findOne()
                .orElse(null)
        }
    }

    override fun getUserById(id: Int): User? {
        return jdbi.withHandle<User?, Exception> { handle ->
            handle.createQuery(
                """
                SELECT id, username, email, password_hash AS passwordHash, role, status, created_at AS createdAt
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

    override fun updateUserStatus(userId: Int, status: UserStatus) {
        jdbi.withHandle<Unit, Exception> { handle ->
            handle.createUpdate(
                "UPDATE users SET status = :status::user_status WHERE id = :id"
            )
                .bind("status", status.name)
                .bind("id", userId)
                .execute()
        }
    }

    /**
     * Executes a user directory lookup mapping relative follow connections in real-time.
     * Uses `ILIKE` logic filtering for partial matches while dropping corporate owner accounts from results.
     */
    override fun searchUsers(query: String, currentUserId: Int): List<UserSearchDbModel> {
        return jdbi.withHandle<List<UserSearchDbModel>, Exception> { handle ->
            handle.createQuery(
                """
                SELECT 
                    u.id, 
                    u.username, 
                    cp.avatar_url AS avatarUrl,
                    EXISTS(SELECT 1 FROM follows_climber WHERE follower_id = :currentUserId AND followed_id = u.id) AS isFollowing
                FROM users u
                LEFT JOIN climber_profiles cp ON u.id = cp.user_id
                WHERE u.username ILIKE :query AND u.id != :currentUserId AND u.role = 'CLIMBER'
                LIMIT 20
                """
            )
                .bind("query", "%$query%")
                .bind("currentUserId", currentUserId)
                .mapTo(UserSearchDbModel::class.java)
                .list()
        }
    }

    override fun updateUsername(userId: Int, username: String) {
        jdbi.withHandle<Unit, Exception> { handle ->
            handle.createUpdate("UPDATE users SET username = :username WHERE id = :id")
                .bind("username", username)
                .bind("id", userId)
                .execute()
        }
    }
}
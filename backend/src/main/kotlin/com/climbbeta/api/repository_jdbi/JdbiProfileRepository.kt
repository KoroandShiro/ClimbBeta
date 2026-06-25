package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.repository.ProfileRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

/**
 * JDBI implementation of the [ProfileRepository].
 *
 * Processes personal bio statements, biometrics (height, ape index), and asset URL mappings
 * for users configured under the system's climber scope.
 */
@Repository
class JdbiProfileRepository(private val jdbi: Jdbi) : ProfileRepository {

    override fun getClimberProfile(userId: Int): ClimberProfile? {
        return jdbi.withHandle<ClimberProfile?, Exception> { handle ->
            handle.createQuery(
                """
                SELECT user_id AS userId, bio, height, ape_index AS apeIndex , avatar_url AS avatarUrl
                FROM climber_profiles 
                WHERE user_id = :userId
                """
            )
                .bind("userId", userId)
                .mapTo(ClimberProfile::class.java)
                .findOne()
                .orElse(null)
        }
    }

    override fun updateClimberProfile(profile: ClimberProfile) {
        jdbi.withHandle<Unit, Exception> { handle ->
            handle.createUpdate(
                """
                UPDATE climber_profiles 
                SET bio = :bio, height = :height, ape_index = :apeIndex 
                WHERE user_id = :userId
                """
            )
                .bind("bio", profile.bio)
                .bind("height", profile.height)
                .bind("apeIndex", profile.apeIndex)
                .bind("userId", profile.userId)
                .execute()
        }
    }

    override fun updateAvatarUrl(userId: Int, avatarUrl: String?) {
        jdbi.withHandle<Unit, Exception> { handle ->
            handle.createUpdate(
                """
                UPDATE climber_profiles 
                SET avatar_url = :avatarUrl 
                WHERE user_id = :userId
                """
            )
                .bind("avatarUrl", avatarUrl)
                .bind("userId", userId)
                .execute()
        }
    }
}
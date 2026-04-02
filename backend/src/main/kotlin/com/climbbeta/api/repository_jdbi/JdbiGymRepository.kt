package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Gym
import com.climbbeta.api.repository.GymRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

@Repository
class JdbiGymRepository(
    private val jdbi: Jdbi
) : GymRepository {

    override fun createGym(gym: Gym): Gym {
        return jdbi.withHandle<Gym, Exception> { handle ->
            val generatedId = handle.createUpdate(
                """
                INSERT INTO gyms (owner_id, name, address, city, cover_image_url)
                VALUES (:ownerId, :name, :address, :city, :coverImageUrl)
                """
            )
                .bind("ownerId", gym.ownerId)
                .bind("name", gym.name)
                .bind("address", gym.address)
                .bind("city", gym.city)
                .bind("coverImageUrl", gym.coverImageUrl)
                .executeAndReturnGeneratedKeys("id")
                .mapTo(Int::class.java)
                .one()

            gym.copy(id = generatedId)
        }
    }

    override fun getGyms(): List<Gym> {
        return jdbi.withHandle<List<Gym>, Exception> { handle ->
            handle.createQuery(
                """
                SELECT
                    id,
                    owner_id AS ownerId,
                    name,
                    address,
                    city,
                    cover_image_url AS coverImageUrl
                FROM gyms
                ORDER BY id ASC
                """
            )
                .mapTo(Gym::class.java)
                .list()
        }
    }

    override fun getGymById(id: Int): Gym? {
        return jdbi.withHandle<Gym?, Exception> { handle ->
            handle.createQuery(
                """
                SELECT
                    id,
                    owner_id AS ownerId,
                    name,
                    address,
                    city,
                    cover_image_url AS coverImageUrl
                FROM gyms
                WHERE id = :id
                """
            )
                .bind("id", id)
                .mapTo(Gym::class.java)
                .findOne()
                .orElse(null)
        }
    }

    override fun updateGym(gym: Gym): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            val rows = handle.createUpdate(
                """
                UPDATE gyms
                SET
                    name = :name,
                    address = :address,
                    city = :city,
                    cover_image_url = :coverImageUrl
                WHERE id = :id
                """
            )
                .bind("id", gym.id)
                .bind("name", gym.name)
                .bind("address", gym.address)
                .bind("city", gym.city)
                .bind("coverImageUrl", gym.coverImageUrl)
                .execute()

            rows > 0
        }
    }

    override fun existsGymOwnerProfile(userId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            handle.createQuery(
                """
                SELECT COUNT(*)
                FROM gym_owner_profiles
                WHERE user_id = :userId
                """
            )
                .bind("userId", userId)
                .mapTo(Int::class.java)
                .one() > 0
        }
    }
}
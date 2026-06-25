package com.climbbeta.api.services

import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.domain.UserStatus
import com.climbbeta.api.repository.GymRepository
import com.climbbeta.api.repository.UserRepository
import org.springframework.stereotype.Service

/**
 * Service managing corporate profiles and facilities rules for physical climbing gyms.
 *
 * Implements verification policies governing managers, multi-role security boundaries,
 * and structured facility telemetry updates.
 */
@Service
class GymService(
    private val gymRepository: GymRepository,
    private val userRepository: UserRepository
) {

    /**
     * Enrolls a new climbing facility into the platform directory.
     *
     * Restricts execution to ADMIN accounts or verified GYM_OWNER personas managing
     * their personal assigned IDs.
     *
     * @throws SecurityException If the initiator is unverified or impersonates another user.
     * @throws IllegalArgumentException If structural fields are empty or the target owner profile does not exist.
     */
    fun createGym(
        authenticatedUser: User, ownerId: Int, name: String,
        address: String, city: String, coverImageUrl: String?
    ): Gym {
        validateGymData(ownerId, name, address, city)

        if (authenticatedUser.role != UserRole.ADMIN && authenticatedUser.role != UserRole.GYM_OWNER) {
            throw SecurityException("Only ADMIN or GYM_OWNER can create gyms.")
        }

        if (authenticatedUser.role == UserRole.GYM_OWNER && authenticatedUser.status != UserStatus.VERIFIED) {
            throw SecurityException("Account must be verified before creating gyms. Please enter the activation code.")
        }

        if (authenticatedUser.role == UserRole.GYM_OWNER && authenticatedUser.id != ownerId) {
            throw SecurityException("GYM_OWNER can only create gyms using their own ownerId.")
        }

        if (!gymRepository.existsGymOwnerProfile(ownerId)) {
            throw IllegalArgumentException("Invalid ownerId: gym owner profile does not exist.")
        }

        val ownerUser = userRepository.getUserById(ownerId)
            ?: throw IllegalArgumentException("Invalid ownerId: user not found.")

        if (ownerUser.role != UserRole.GYM_OWNER) {
            throw IllegalArgumentException("Invalid ownerId: user does not have the GYM_OWNER role.")
        }

        val gym = Gym(
            id = 0, ownerId = ownerId, name = name.trim(), address = address.trim(),
            city = city.trim(), coverImageUrl = coverImageUrl?.trim()?.ifBlank { null }
        )

        return gymRepository.createGym(gym)
    }

    fun getGyms(): List<Gym> = gymRepository.getGyms()

    /**
     * Extracts a gym entity filtered by its structural primary key.
     *
     * @throws NoSuchElementException If the facility record is absent.
     */
    fun getGymById(id: Int): Gym {
        if (id <= 0) throw IllegalArgumentException("Invalid ID.")

        return gymRepository.getGymById(id)
            ?: throw NoSuchElementException("Gym not found.")
    }

    /**
     * Updates an existing gym profile details.
     *
     * Enforces the exact same security checks as the creation step, preventing
     * unprivileged edits across different business owners.
     */
    fun updateGym(
        authenticatedUser: User, id: Int, name: String,
        address: String, city: String, coverImageUrl: String?
    ) {
        if (id <= 0) throw IllegalArgumentException("Invalid ID.")

        val existingGym = gymRepository.getGymById(id)
            ?: throw NoSuchElementException("Gym not found.")

        if (authenticatedUser.role != UserRole.ADMIN && authenticatedUser.role != UserRole.GYM_OWNER) {
            throw SecurityException("Only ADMIN or GYM_OWNER can update gyms.")
        }

        if (authenticatedUser.role == UserRole.GYM_OWNER && existingGym.ownerId != authenticatedUser.id) {
            throw SecurityException("GYM_OWNER can only update their own gym.")
        }

        validateGymData(existingGym.ownerId, name, address, city)

        val updatedGym = existingGym.copy(
            name = name.trim(), address = address.trim(), city = city.trim(),
            coverImageUrl = coverImageUrl?.trim()?.ifBlank { null }
        )

        val updated = gymRepository.updateGym(updatedGym)
        if (!updated) {
            throw NoSuchElementException("Gym not found for verification/update.")
        }
    }

    private fun validateGymData(ownerId: Int, name: String, address: String, city: String) {
        if (ownerId <= 0) throw IllegalArgumentException("Invalid ownerId.")
        if (name.isBlank()) throw IllegalArgumentException("name is required.")
        if (address.isBlank()) throw IllegalArgumentException("address is required.")
        if (city.isBlank()) throw IllegalArgumentException("city is required.")
    }
}
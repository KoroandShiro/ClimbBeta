package com.climbbeta.api.services

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.BoulderRepository
import com.climbbeta.api.repository.GymRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

/**
 * Service managing indoor climbing route (boulder) lifecycles.
 *
 * Handles creation of new routes, retrieval of active boulders,
 * and status updates (archiving/deactivation) while enforcing ownership safety.
 *
 * @property boulderRepository Data access layer for boulder entities.
 * @property gymRepository Data access layer to verify gym profiles.
 */
@Service
class BoulderService(
    private val boulderRepository: BoulderRepository,
    private val gymRepository: GymRepository
) {

    /**
     * Registers a new boulder route inside a specific gym.
     *
     * Validates gym existence and ensures the acting user is either a system ADMIN
     * or the explicit owner of the target gym.
     *
     * @param user The user initiating the creation request.
     * @param gymId The target gym where the route is located.
     * @return The fully populated [Boulder] instance after persistence.
     * @throws IllegalArgumentException If the specified gym does not exist.
     * @throws SecurityException If the user lacks permission to modify this gym.
     */
    fun createBoulder(
        user: User, gymId: Int, color: String, hexColor: String?,
        grade: String, setterName: String?, setDate: LocalDate, imageUrl: String?
    ): Boulder {
        val gym = gymRepository.getGymById(gymId)
            ?: throw IllegalArgumentException("Gym not found.")

        if (user.role != UserRole.ADMIN && gym.ownerId != user.id) {
            throw SecurityException("Only the gym owner can add routes here.")
        }

        val boulder = Boulder(
            gymId = gymId, color = color, hexColor = hexColor, grade = grade,
            setterName = setterName, setDate = setDate, imageUrl = imageUrl
        )
        return boulderRepository.createBoulder(boulder)
    }

    /**
     * Retrieves all active (non-archived) boulder routes for a specific facility.
     */
    fun getActiveBoulders(gymId: Int): List<Boulder> {
        return boulderRepository.getBouldersByGymId(gymId)
    }

    /**
     * Updates the operational status (active/inactive) of an existing boulder route.
     *
     * Used mainly to strip down or archive routes that are no longer available on the wall.
     *
     * @throws IllegalArgumentException If the route or its parent gym is untraceable.
     * @throws SecurityException If the user is neither an ADMIN nor the owner of the hosting gym.
     */
    fun updateBoulderStatus(user: User, boulderId: Int, isActive: Boolean) {
        val boulder = boulderRepository.getBoulderById(boulderId)
            ?: throw IllegalArgumentException("Route not found.")

        val gym = gymRepository.getGymById(boulder.gymId)
            ?: throw IllegalArgumentException("Associated gym not found.")

        if (user.role != UserRole.ADMIN && gym.ownerId != user.id) {
            throw SecurityException("Only the gym owner can deactivate this route.")
        }

        boulderRepository.updateBoulderStatus(boulderId, isActive)
    }

    fun getBoulderById(boulderId: Int): Boulder? {
        return boulderRepository.getBoulderById(boulderId)
    }
}
package com.climbbeta.api.services

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.repository.AscentRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

/**
 * Service handling the business logic for climbing ascents (logbook).
 *
 * Manages creation, retrieval, and deletion of both indoor (boulder)
 * and outdoor route logs for climbers.
 *
 * @property ascentRepository Data access layer for ascent records.
 * @see AscentController for the HTTP endpoints exposing these services.
 */
@Service
class AscentService(private val ascentRepository: AscentRepository) {

    /**
     * Logs a new ascent for a climber.
     *
     * Validates that an ascent cannot simultaneously be marked as an indoor boulder
     * and an outdoor route. If no date is provided, defaults to today.
     *
     * @param climberId The ID of the user logging the ascent.
     * @param boulderId ID of the indoor boulder (null if outdoor).
     * @param outdoorRouteId ID of the outdoor route (null if indoor).
     * @param attempts Number of attempts taken to complete the route.
     * @return The unique ID of the newly created ascent record.
     * @throws IllegalArgumentException If both boulderId and outdoorRouteId are provided.
     */
    fun logAscent(
        climberId: Int, boulderId: Int?, outdoorRouteId: Int?,
        freelogGymName: String?, freelogGrade: String?,
        date: LocalDate?, attempts: Int, style: String?, notes: String?
    ): Int {
        if (boulderId != null && outdoorRouteId != null) {
            throw IllegalArgumentException("An ascent cannot be both Indoor and Outdoor at the same time.")
        }

        return ascentRepository.create(
            climberId, boulderId, outdoorRouteId,
            freelogGymName, freelogGrade,
            date ?: LocalDate.now(),
            attempts, style, notes
        )
    }

    fun getClimberLogbook(climberId: Int) = ascentRepository.getByClimberId(climberId)
    fun getAscentById(id: Int): Ascent? = ascentRepository.getById(id)
    fun removeAscent(id: Int, climberId: Int) = ascentRepository.delete(id, climberId)
    fun getFeedForClimber(climberId: Int) = ascentRepository.getFeedForClimber(climberId)
}
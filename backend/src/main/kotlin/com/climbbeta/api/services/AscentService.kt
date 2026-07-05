package com.climbbeta.api.services

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.repository.AscentRepository
import com.climbbeta.api.repository.BoulderRepository
import com.climbbeta.api.repository.MediaRepository
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
class AscentService(
    private val ascentRepository: AscentRepository,
    private val outdoorRouteService: OutdoorRouteService,
    private val mediaRepository: MediaRepository,
    private val boulderRepository: BoulderRepository
) {

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
        require(attempts >= 1) { "The number of attempts must be at least 1." }

        if (boulderId != null && outdoorRouteId != null) {
            throw IllegalArgumentException("An ascent cannot be both Indoor and Outdoor at the same time.")
        }

        // Integrity guard: a boulder can only be logged if it exists AND is still active.
        // Without this, the feed shortcut / the gym badge / the saved projects would allow
        // logging a soft-deleted boulder (is_active = false) that is no longer on the wall.
        if (boulderId != null) {
            val boulder = boulderRepository.getBoulderById(boulderId)
                ?: throw NoSuchElementException("This boulder does not exist.")
            if (!boulder.isActive) {
                throw IllegalStateException("This boulder has been archived and no longer accepts logs.")
            }
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
    fun getAscentDetail(ascentId: Int, viewerId: Int) = ascentRepository.getAscentDetail(ascentId, viewerId)
    fun getAscentsByClimber(climberId: Int, viewerId: Int) = ascentRepository.getAscentsByClimber(climberId, viewerId)
    fun getClimberStats(climberId: Int) = ascentRepository.getClimberStats(climberId)

    /**
     * Logs a "hybrid free log" ascent that is NOT tied to a partner gym's boulder.
     *
     * Two modes:
     *  - "GYM"  : a session at a non-partner gym -> stored in the freelog_* columns of `ascents`.
     *  - "ROCK" : an outdoor climb -> reuses an existing `outdoor_routes` row (find-or-create) and
     *             links the ascent to it via outdoor_route_id.
     *
     * An optional photo URL (already uploaded to MinIO via /media/upload) is persisted as a row in
     * the `media` table, which the social feed query already reads.
     *
     * @throws IllegalArgumentException If the mode is unknown or required fields for that mode are missing.
     */
    fun logFreelog(
        climberId: Int, mode: String, freelogGymName: String?, grade: String?,
        routeName: String?, sector: String?, location: String?,
        date: LocalDate?, attempts: Int, style: String?, notes: String?, mediaUrl: String?
    ): Int {
        require(attempts >= 1) { "The number of attempts must be at least 1." }

        val ascentDate = date ?: LocalDate.now()

        val ascentId = when (mode.uppercase()) {
            "GYM" -> {
                require(!freelogGymName.isNullOrBlank()) { "freelogGymName is required for a non-partner gym log." }
                require(!grade.isNullOrBlank()) { "grade is required." }
                ascentRepository.create(climberId, null, null, freelogGymName, grade, ascentDate, attempts, style, notes)
            }
            "ROCK" -> {
                require(!location.isNullOrBlank()) { "location is required for an outdoor log." }
                require(!sector.isNullOrBlank()) { "sector is required for an outdoor log." }
                require(!grade.isNullOrBlank()) { "grade is required." }
                val outdoorRouteId = outdoorRouteService.findOrCreate(climberId, routeName, sector, location, grade)
                ascentRepository.create(climberId, null, outdoorRouteId, null, null, ascentDate, attempts, style, notes)
            }
            else -> throw IllegalArgumentException("Invalid mode '$mode'. Use 'GYM' or 'ROCK'.")
        }

        if (!mediaUrl.isNullOrBlank()) {
            mediaRepository.create(climberId, ascentId, mediaUrl, "IMAGE")
        }
        return ascentId
    }
}
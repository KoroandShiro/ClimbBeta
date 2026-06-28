package com.climbbeta.api.domain

/**
 * Quick performance stats for a climber's profile header.
 *
 * Max grades are the hardest logged grade of each kind (ordered by the numeric part of the
 * V-scale), or null if the climber has no ascent of that kind yet.
 */
data class ClimberStats(
    val totalAscents: Int,
    val maxIndoorGrade: String?,
    val maxOutdoorGrade: String?
)

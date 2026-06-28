package com.climbbeta.api.repository

import com.climbbeta.api.domain.Ascent
import java.time.LocalDate
import com.climbbeta.api.domain.FeedItem
import com.climbbeta.api.domain.ClimberStats

interface AscentRepository {
    fun create(
        climberId: Int,
        boulderId: Int?,
        outdoorRouteId: Int?,
        freelogGymName: String?,
        freelogGrade: String?,
        date: LocalDate,
        attempts: Int,
        style: String?,
        notes: String?
    ): Int

    fun getByClimberId(climberId: Int): List<Ascent>
    fun getById(id: Int): Ascent?
    fun delete(id: Int, climberId: Int): Boolean
    fun getFeedForClimber(climberId: Int): List<FeedItem>
    fun getAscentDetail(ascentId: Int, viewerId: Int): FeedItem?

    /** A climber's own ascents (enriched as feed items), most recent first. */
    fun getAscentsByClimber(climberId: Int, viewerId: Int): List<FeedItem>

    /** Quick profile stats: total ascents + hardest indoor/outdoor grade. */
    fun getClimberStats(climberId: Int): ClimberStats
}
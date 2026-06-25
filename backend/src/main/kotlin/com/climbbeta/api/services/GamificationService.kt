package com.climbbeta.api.services

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.LeaderboardEntry
import com.climbbeta.api.repository.BoulderRepository
import com.climbbeta.api.repository.LikeRepository
import com.climbbeta.api.repository.SaveRepository
import org.springframework.stereotype.Service

/**
 * Service administering engagement systems, bookmarks, and performance leaderboards.
 *
 * Governs climber interactions like liking gym logs, saving complex routes as active projects,
 * and aggregating leaderboard standings for individual tracks.
 */
@Service
class GamificationService(
    private val likeRepository: LikeRepository,
    private val saveRepository: SaveRepository,
    private val boulderRepository: BoulderRepository
) {

    fun likeAscent(climberId: Int, ascentId: Int): Boolean = likeRepository.like(climberId, ascentId)
    fun unlikeAscent(climberId: Int, ascentId: Int): Boolean = likeRepository.unlike(climberId, ascentId)
    fun isAscentLiked(climberId: Int, ascentId: Int): Boolean = likeRepository.isLiked(climberId, ascentId)
    fun getAscentLikeCount(ascentId: Int): Int = likeRepository.getLikeCount(ascentId)

    /**
     * Bookmarks a specific boulder route as a personal project for a climber.
     *
     * @return true if added successfully; false if it was already marked as a project.
     */
    fun saveBoulder(climberId: Int, boulderId: Int): Boolean = saveRepository.save(climberId, boulderId)
    fun unsaveBoulder(climberId: Int, boulderId: Int): Boolean = saveRepository.unsave(climberId, boulderId)
    fun isBoulderSaved(climberId: Int, boulderId: Int): Boolean = saveRepository.isSaved(climberId, boulderId)
    fun getSavedBoulders(climberId: Int): List<Boulder> = saveRepository.getSavedBoulders(climberId)

    /**
     * Compiles a speed/attempt structured leaderboard for a targeted indoor route.
     *
     * @return Ordered list of [LeaderboardEntry] detailing matching high scores.
     */
    fun getLeaderboard(boulderId: Int): List<LeaderboardEntry> = boulderRepository.getLeaderboard(boulderId)
}
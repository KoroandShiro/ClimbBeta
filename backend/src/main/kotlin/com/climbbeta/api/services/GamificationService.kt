package com.climbbeta.api.services

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.LeaderboardEntry
import com.climbbeta.api.repository.BoulderRepository
import com.climbbeta.api.repository.LikeRepository
import com.climbbeta.api.repository.SaveRepository
import org.springframework.stereotype.Service

@Service
class GamificationService(
    private val likeRepository: LikeRepository,
    private val saveRepository: SaveRepository,
    private val boulderRepository: BoulderRepository
) {

    fun likeAscent(climberId: Int, ascentId: Int): Boolean {
        return likeRepository.like(climberId, ascentId)
    }

    fun unlikeAscent(climberId: Int, ascentId: Int): Boolean {
        return likeRepository.unlike(climberId, ascentId)
    }

    fun isAscentLiked(climberId: Int, ascentId: Int): Boolean {
        return likeRepository.isLiked(climberId, ascentId)
    }

    fun getAscentLikeCount(ascentId: Int): Int {
        return likeRepository.getLikeCount(ascentId)
    }

    fun saveBoulder(climberId: Int, boulderId: Int): Boolean {
        return saveRepository.save(climberId, boulderId)
    }

    fun unsaveBoulder(climberId: Int, boulderId: Int): Boolean {
        return saveRepository.unsave(climberId, boulderId)
    }

    fun isBoulderSaved(climberId: Int, boulderId: Int): Boolean {
        return saveRepository.isSaved(climberId, boulderId)
    }

    fun getSavedBoulders(climberId: Int): List<Boulder> {
        return saveRepository.getSavedBoulders(climberId)
    }

    fun getLeaderboard(boulderId: Int): List<LeaderboardEntry> {
        return boulderRepository.getLeaderboard(boulderId)
    }
}

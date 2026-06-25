package com.climbbeta.api.services

import com.climbbeta.api.repository.FollowRepository
import org.springframework.stereotype.Service

/**
 * Service managing the social graph and relationship connections between climbers.
 *
 * Provides operations to connect, disconnect, and analyze follower metrics.
 *
 * @property followRepository Data access layer mapping user-to-user links.
 */
@Service
class FollowService(private val followRepository: FollowRepository) {

    /**
     * Establishes a follow relationship between two users.
     *
     * @param followerId The user subscribing to updates.
     * @param followedId The user target being followed.
     * @return true if a new relation link was forged; false if it already existed.
     */
    fun follow(followerId: Int, followedId: Int): Boolean {
        return followRepository.follow(followerId, followedId)
    }

    fun unfollow(followerId: Int, followedId: Int): Boolean {
        return followRepository.unfollow(followerId, followedId)
    }

    fun isFollowing(followerId: Int, followedId: Int): Boolean {
        return followRepository.isFollowing(followerId, followedId)
    }

    fun getFollowersCount(userId: Int): Int = followRepository.getFollowersCount(userId)
    fun getFollowingCount(userId: Int): Int = followRepository.getFollowingCount(userId)
}
package com.climbbeta.api.repository

import com.climbbeta.api.domain.ClimberSummary

interface FollowRepository {
    fun follow(followerId: Int, followedId: Int): Boolean
    fun unfollow(followerId: Int, followedId: Int): Boolean
    fun isFollowing(followerId: Int, followedId: Int): Boolean
    fun getFollowersCount(userId: Int): Int
    fun getFollowingCount(userId: Int): Int

    /** Climbers who follow [userId]; [viewerId] resolves the Follow/Unfollow flag. */
    fun getFollowers(userId: Int, viewerId: Int): List<ClimberSummary>

    /** Climbers that [userId] follows; [viewerId] resolves the Follow/Unfollow flag. */
    fun getFollowing(userId: Int, viewerId: Int): List<ClimberSummary>
}

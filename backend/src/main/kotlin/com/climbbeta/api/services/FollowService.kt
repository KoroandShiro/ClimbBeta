package com.climbbeta.api.services

import com.climbbeta.api.repository.FollowRepository
import org.springframework.stereotype.Service

@Service
class FollowService(private val followRepository: FollowRepository) {

    fun follow(followerId: Int, followedId: Int): Boolean {
        return followRepository.follow(followerId, followedId)
    }

    fun unfollow(followerId: Int, followedId: Int): Boolean {
        return followRepository.unfollow(followerId, followedId)
    }

    fun isFollowing(followerId: Int, followedId: Int): Boolean {
        return followRepository.isFollowing(followerId, followedId)
    }

    fun getFollowersCount(userId: Int): Int {
        return followRepository.getFollowersCount(userId)
    }

    fun getFollowingCount(userId: Int): Int {
        return followRepository.getFollowingCount(userId)
    }
}
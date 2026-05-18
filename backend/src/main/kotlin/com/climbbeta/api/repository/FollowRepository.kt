package com.climbbeta.api.repository

interface FollowRepository {
    fun follow(followerId: Int, followedId: Int): Boolean
    fun unfollow(followerId: Int, followedId: Int): Boolean
    fun isFollowing(followerId: Int, followedId: Int): Boolean
    fun getFollowersCount(userId: Int): Int
    fun getFollowingCount(userId: Int): Int
}

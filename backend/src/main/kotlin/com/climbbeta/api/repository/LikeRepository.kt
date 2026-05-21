package com.climbbeta.api.repository

interface LikeRepository {
    fun like(climberId: Int, ascentId: Int): Boolean
    fun unlike(climberId: Int, ascentId: Int): Boolean
    fun isLiked(climberId: Int, ascentId: Int): Boolean
    fun getLikeCount(ascentId: Int): Int
}

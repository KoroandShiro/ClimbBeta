package com.climbbeta.api.domain

/**
 * Lightweight public view of a climber used in follow lists (and shaped like the search result):
 * id, handle, avatar, and whether the requesting viewer already follows them (drives Follow/Unfollow).
 */
data class ClimberSummary(
    val id: Int,
    val username: String,
    val avatarUrl: String?,
    val isFollowing: Boolean
)

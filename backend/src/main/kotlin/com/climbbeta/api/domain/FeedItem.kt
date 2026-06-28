package com.climbbeta.api.domain

data class FeedItem(
    val ascent: Ascent,
    val authorUsername: String,
    val authorAvatarUrl: String? = null,
    val postImageUrl: String? = null,
    val routeName: String? = null,
    val routeGrade: String? = null,
    /** Derived ascent kind for the feed card: 'INDOOR', 'OUTDOOR' or 'FREELOG_GYM'. */
    val logType: String = "FREELOG_GYM",
    /** Partner gym name (only present for INDOOR logs). */
    val gymName: String? = null,
    /** Total likes on this ascent. */
    val likeCount: Int = 0,
    /** Whether the requesting climber has already liked it (drives the filled heart). */
    val likedByMe: Boolean = false,
    /** Total comments on this ascent. */
    val commentCount: Int = 0,
)

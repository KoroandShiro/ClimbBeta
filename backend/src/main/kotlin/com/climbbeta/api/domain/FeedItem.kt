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
)

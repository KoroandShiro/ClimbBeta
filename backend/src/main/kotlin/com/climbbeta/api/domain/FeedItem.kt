package com.climbbeta.api.domain

data class FeedItem(
    val ascent: Ascent,
    val authorUsername: String,
    val authorAvatarUrl: String? = null
)

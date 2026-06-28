package com.climbbeta.api.domain

/**
 * A comment on an ascent, already joined with its author's public info,
 * ready to be rendered in the ascent detail screen.
 */
data class CommentItem(
    val id: Int,
    val authorId: Int,
    val authorUsername: String,
    val authorAvatarUrl: String?,
    val text: String,
    val createdAt: String
)

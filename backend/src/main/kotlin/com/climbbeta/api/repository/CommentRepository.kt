package com.climbbeta.api.repository

import com.climbbeta.api.domain.CommentItem

interface CommentRepository {
    /** All comments of an ascent, oldest first, joined with the author's username/avatar. */
    fun getByAscentId(ascentId: Int): List<CommentItem>

    /** Inserts a comment and returns it already joined with the author's info. */
    fun create(ascentId: Int, authorId: Int, text: String): CommentItem
}

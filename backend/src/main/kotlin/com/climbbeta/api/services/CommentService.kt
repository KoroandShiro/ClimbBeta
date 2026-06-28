package com.climbbeta.api.services

import com.climbbeta.api.domain.CommentItem
import com.climbbeta.api.repository.CommentRepository
import org.springframework.stereotype.Service

/**
 * Service for ascent comments. Keeps the rule trivial (non-empty text) on purpose —
 * the heavy lifting (author join) lives in the repository.
 */
@Service
class CommentService(private val commentRepository: CommentRepository) {

    fun getComments(ascentId: Int): List<CommentItem> = commentRepository.getByAscentId(ascentId)

    /**
     * @throws IllegalArgumentException If the comment text is blank (-> 400 via GlobalExceptionHandler).
     */
    fun addComment(ascentId: Int, authorId: Int, text: String): CommentItem {
        val clean = text.trim()
        require(clean.isNotEmpty()) { "Comment text cannot be empty." }
        return commentRepository.create(ascentId, authorId, clean)
    }
}

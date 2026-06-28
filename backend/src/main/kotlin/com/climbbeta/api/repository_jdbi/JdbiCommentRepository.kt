package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.CommentItem
import com.climbbeta.api.repository.CommentRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository
import java.sql.ResultSet

/**
 * JDBI implementation of the [CommentRepository].
 *
 * Joins each comment with its author (users + climber_profiles) so the client gets a
 * ready-to-render row, mirroring how the feed query resolves author info.
 */
@Repository
class JdbiCommentRepository(private val jdbi: Jdbi) : CommentRepository {

    private val selectWithAuthor = """
        SELECT c.id, c.author_id, c.comment_text, c.created_at,
               u.username AS author_username,
               cp.avatar_url AS author_avatar
        FROM comments c
        JOIN users u ON u.id = c.author_id
        LEFT JOIN climber_profiles cp ON cp.user_id = c.author_id
    """

    private fun mapComment(rs: ResultSet): CommentItem = CommentItem(
        id = rs.getInt("id"),
        authorId = rs.getInt("author_id"),
        authorUsername = rs.getString("author_username"),
        authorAvatarUrl = rs.getString("author_avatar"),
        text = rs.getString("comment_text"),
        createdAt = rs.getTimestamp("created_at").toInstant().toString()
    )

    override fun getByAscentId(ascentId: Int): List<CommentItem> {
        return jdbi.withHandle<List<CommentItem>, Exception> { handle ->
            handle.createQuery("$selectWithAuthor WHERE c.ascent_id = :ascentId ORDER BY c.created_at ASC")
                .bind("ascentId", ascentId)
                .map { rs, _ -> mapComment(rs) }
                .list()
        }
    }

    override fun create(ascentId: Int, authorId: Int, text: String): CommentItem {
        return jdbi.withHandle<CommentItem, Exception> { handle ->
            val newId = handle.createUpdate(
                """
                INSERT INTO comments (ascent_id, author_id, comment_text)
                VALUES (:ascentId, :authorId, :text)
                """
            )
                .bind("ascentId", ascentId)
                .bind("authorId", authorId)
                .bind("text", text)
                .executeAndReturnGeneratedKeys("id")
                .mapTo(Int::class.java)
                .one()

            handle.createQuery("$selectWithAuthor WHERE c.id = :id")
                .bind("id", newId)
                .map { rs, _ -> mapComment(rs) }
                .one()
        }
    }
}

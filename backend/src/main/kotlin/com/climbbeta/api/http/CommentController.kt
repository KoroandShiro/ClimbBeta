package com.climbbeta.api.http

import com.climbbeta.api.domain.CommentItem
import com.climbbeta.api.domain.User
import com.climbbeta.api.services.CommentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class CommentInputModel(val text: String)

/**
 * REST endpoints for the social comment thread of an ascent.
 *
 * Shares the /ascents base path with the other ascent controllers; the method paths
 * (/comments) don't collide with /details or /like.
 */
@RestController
@RequestMapping("/ascents")
class CommentController(private val commentService: CommentService) {

    @GetMapping("/{id}/comments")
    fun getComments(@PathVariable id: Int): List<CommentItem> =
        commentService.getComments(id)

    @PostMapping("/{id}/comments")
    fun addComment(
        @PathVariable id: Int,
        @RequestBody input: CommentInputModel,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<CommentItem> {
        val created = commentService.addComment(id, user.id, input.text)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }
}

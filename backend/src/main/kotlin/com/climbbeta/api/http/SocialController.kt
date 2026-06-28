package com.climbbeta.api.http

import com.climbbeta.api.domain.ClimberSummary
import com.climbbeta.api.domain.User
import com.climbbeta.api.services.AscentService
import com.climbbeta.api.services.FollowService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * REST Controller structuring social connectivity and follow relationships.
 *
 * Exposes social operations like profile subscription setups and tailored log feed aggregation.
 */
@RestController
class SocialController(
    private val followService: FollowService,
    private val ascentService: AscentService
) {

    /**
     * Follows another climber. Prevents users from subscribing to themselves.
     */
    @PostMapping("/climbers/{id}/follow")
    fun follow(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Unit> {
        if (user.id == id) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
        }
        val created = followService.follow(user.id, id)
        return if (created) {
            ResponseEntity.status(HttpStatus.CREATED).build()
        } else {
            ResponseEntity.status(HttpStatus.OK).build()
        }
    }

    @DeleteMapping("/climbers/{id}/follow")
    fun unfollow(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Unit> {
        val deleted = followService.unfollow(user.id, id)
        return if (deleted) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }

    /** Climbers who follow user [id] (each flagged with whether the requester follows them back). */
    @GetMapping("/climbers/{id}/followers")
    fun getFollowers(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<List<ClimberSummary>> =
        ResponseEntity.ok(followService.getFollowers(id, user.id))

    /** Climbers that user [id] follows. */
    @GetMapping("/climbers/{id}/following")
    fun getFollowing(
        @PathVariable id: Int,
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<List<ClimberSummary>> =
        ResponseEntity.ok(followService.getFollowing(id, user.id))

    /**
     * Compiles a timeline of recent logs recorded by climbers the user follows.
     */
    @GetMapping("/feed")
    fun getFeed(
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val items = ascentService.getFeedForClimber(user.id)
        return ResponseEntity.ok(items)
    }
}
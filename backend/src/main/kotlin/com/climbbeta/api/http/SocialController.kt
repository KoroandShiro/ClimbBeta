package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.services.AscentService
import com.climbbeta.api.services.FollowService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class SocialController(
    private val followService: FollowService,
    private val ascentService: AscentService
) {

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
            ResponseEntity.status(HttpStatus.OK).build()  // Already following
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

    @GetMapping("/feed")
    fun getFeed(
        @RequestAttribute("authenticatedUser") user: User
    ): ResponseEntity<Any> {
        val items = ascentService.getFeedForClimber(user.id)
        return ResponseEntity.ok(items)
    }
}
package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JdbiFollowRepositoryTests : JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val followRepo = JdbiFollowRepository(jdbi)

    @Test
    fun `follow deve inserir registo em follows_climber`() {
        val user1 = createUser("user1", "user1@test.com")
        val user2 = createUser("user2", "user2@test.com")

        val success = followRepo.follow(user1.id, user2.id)

        assertTrue(success)
        assertTrue(followRepo.isFollowing(user1.id, user2.id))
    }

    @Test
    fun `follow nao permite seguir a si mesmo`() {
        val user = createUser("user", "user@test.com")

        val success = followRepo.follow(user.id, user.id)

        assertFalse(success)
    }

    @Test
    fun `follow nao inserir duplicado ON CONFLICT DO NOTHING`() {
        val user1 = createUser("user1", "user1@test.com")
        val user2 = createUser("user2", "user2@test.com")

        val first = followRepo.follow(user1.id, user2.id)
        val secondAttempt = followRepo.follow(user1.id, user2.id)

        assertTrue(first)
        assertFalse(secondAttempt)
        assertTrue(followRepo.isFollowing(user1.id, user2.id))
    }

    @Test
    fun `unfollow remove o registo`() {
        val user1 = createUser("user1", "user1@test.com")
        val user2 = createUser("user2", "user2@test.com")

        followRepo.follow(user1.id, user2.id)
        val deleted = followRepo.unfollow(user1.id, user2.id)

        assertTrue(deleted)
        assertFalse(followRepo.isFollowing(user1.id, user2.id))
    }

    @Test
    fun `unfollow retorna false se nao estava a seguir`() {
        val user1 = createUser("user1", "user1@test.com")
        val user2 = createUser("user2", "user2@test.com")

        val deleted = followRepo.unfollow(user1.id, user2.id)

        assertFalse(deleted)
    }

    @Test
    fun `isFollowing retorna true quando a seguir`() {
        val user1 = createUser("user1", "user1@test.com")
        val user2 = createUser("user2", "user2@test.com")

        followRepo.follow(user1.id, user2.id)

        assertTrue(followRepo.isFollowing(user1.id, user2.id))
    }

    @Test
    fun `isFollowing retorna false quando nao a seguir`() {
        val user1 = createUser("user1", "user1@test.com")
        val user2 = createUser("user2", "user2@test.com")

        assertFalse(followRepo.isFollowing(user1.id, user2.id))
    }

    @Test
    fun `getFollowersCount conta followers`() {
        val user = createUser("user", "user@test.com")
        val follower1 = createUser("follower1", "follower1@test.com")
        val follower2 = createUser("follower2", "follower2@test.com")

        followRepo.follow(follower1.id, user.id)
        followRepo.follow(follower2.id, user.id)

        val count = followRepo.getFollowersCount(user.id)

        assertEquals(2, count)
    }

    @Test
    fun `getFollowingCount conta users que o user segue`() {
        val user = createUser("user", "user@test.com")
        val following1 = createUser("following1", "following1@test.com")
        val following2 = createUser("following2", "following2@test.com")

        followRepo.follow(user.id, following1.id)
        followRepo.follow(user.id, following2.id)

        val count = followRepo.getFollowingCount(user.id)

        assertEquals(2, count)
    }

    @Test
    fun `multiplos users podem seguir o mesmo user`() {
        val target = createUser("target", "target@test.com")
        val follower1 = createUser("follower1", "follower1@test.com")
        val follower2 = createUser("follower2", "follower2@test.com")

        followRepo.follow(follower1.id, target.id)
        followRepo.follow(follower2.id, target.id)

        assertEquals(2, followRepo.getFollowersCount(target.id))
        assertTrue(followRepo.isFollowing(follower1.id, target.id))
        assertTrue(followRepo.isFollowing(follower2.id, target.id))
    }

    private fun createUser(username: String, email: String): User {
        return userRepo.createUser(
            User(
                username = username,
                email = email,
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )
    }
}

package com.climbbeta.api.pipeline

import com.climbbeta.api.domain.UserRole

/**
 * Declares which [UserRole]s may reach a route.
 *
 * Placed on a controller method (or on the whole controller class) and enforced centrally by
 * [AuthorizationInterceptor]. Routes WITHOUT this annotation stay open to any authenticated user,
 * preserving the previous behaviour.
 *
 * Design note: this only gates by ROLE at the edge (RBAC). Ownership rules (e.g. "only the gym
 * owner edits their own gym") are data-dependent (ABAC) and stay in the services.
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class ProtectedRoute(vararg val roles: UserRole)

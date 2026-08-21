// Contrato que debe cumplir cualquier implementación de repositorio de usuarios,
// independientemente del motor de persistencia usado (actualmente PostgreSQL).
//
// findByEmail(email) -> Promise<User|null>
// findById(id) -> Promise<User|null>
// createUser({ email, username, passwordHash, name }) -> Promise<User>
// saveVerificationToken(userId, token, expiresAt) -> Promise<VerificationToken>
// findVerificationToken(token) -> Promise<VerificationToken|null>
// verifyUser(userId) -> Promise<{ id, is_verified }>

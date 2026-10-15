# Security & Privacy Specification

## 1. Authentication & Session Security

- **Password Hashing**: Bcrypt with minimum 12 salt rounds via Passlib. Plaintext passwords are never logged, stored, or returned.
- **Access Tokens**: Short-lived JSON Web Tokens (JWT) signed with HS256 / RS256, carrying user ID, email, and role claims. Lifetime is 60 minutes.
- **Refresh Sessions**: Rotation-enabled refresh tokens stored in `HttpOnly`, `SameSite=Lax`, and `Secure` cookies.
- **Tenant Isolation**: Every API query enforcing `user_id == current_user.id` on goals, tasks, series, episodes, and media items. Users can never access or modify another user's records.

---

## 2. Media & Storage Security

- **Path Traversal Prevention**: Local storage paths are strictly sanitized with UUID-based keys. No user-supplied filenames are passed to filesystem or shell calls.
- **Safe FFmpeg Command Execution**: All FFmpeg and FFprobe calls use argument arrays (`subprocess.run([binary, ...])`) rather than interpolated shell strings, preventing shell injection.
- **Signed Cloud URLs**: For S3 and Cloudflare R2, private media is delivered via short-lived pre-signed URLs (15-minute expiration).

---

## 3. Responsible AI & Data Safeguards

- **Content Boundaries**: The system prompts explicitly forbid harmful, abusive, or explicit content.
- **Non-Punitive Narrative Setbacks**: Missed tasks generate constructive fictional obstacles or cliffhangers, strictly avoiding humiliation, shaming, or inducing mental distress.
- **Account Deletion (Right to be Forgotten)**: `DELETE /api/v1/auth/me` cascades deletion to all user goals, tasks, narrative states, episodes, scenes, and associated stored media files.

# API Reference

Portal Maestros API endpoints for Portal Teachers and Admin panel.

## Table of Contents

1. [Authentication](#authentication)
2. [Lesson Planning](#lesson-planning)
3. [Observations](#observations)
4. [Evaluations](#evaluations)
5. [Students](#students)
6. [Notifications](#notifications)
7. [Audit Logs](#audit-logs-admin-only)
8. [Error Codes](#error-codes)

---

## Authentication

### Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "maestro@elsistema.pc",
  "password": "••••••••"
}
```

**Response (200):**
```json
{
  "success": true,
  "maestro": {
    "id": "uuid",
    "email": "maestro@elsistema.pc",
    "nombre": "Juan Pérez",
    "role": "teacher"
  },
  "token": "eyJhbGc..."
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Logout

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true
}
```

### Refresh Token

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Authorization: Bearer {refresh_token}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "expires_in": 3600
}
```

---

## Lesson Planning

### List Plans

**Endpoint:** `GET /lessons/plans`

**Query Parameters:**
- `route_id` (optional): Filter by route
- `level_id` (optional): Filter by level
- `page` (optional): Pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "plans": [
    {
      "id": "uuid",
      "route_id": "uuid",
      "route_name": "Iniciación Musical",
      "level": 1,
      "objectives": "Students learn rhythm",
      "activities": "Clapping exercises",
      "duration_minutes": 45,
      "created_at": "2026-05-10T10:00:00Z",
      "published": true
    }
  ],
  "total": 42,
  "page": 1
}
```

### Create Plan

**Endpoint:** `POST /lessons/plans`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "route_id": "uuid",
  "level": 1,
  "objectives": "Students learn rhythm",
  "activities": "Clapping exercises",
  "duration_minutes": 45
}
```

**Response (201):**
```json
{
  "success": true,
  "plan": {
    "id": "new-uuid",
    "route_id": "uuid",
    "level": 1,
    "objectives": "Students learn rhythm",
    "activities": "Clapping exercises",
    "duration_minutes": 45,
    "created_at": "2026-05-10T10:00:00Z",
    "published": false
  }
}
```

### Update Plan

**Endpoint:** `PUT /lessons/plans/{plan_id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "objectives": "Updated objectives",
  "activities": "Updated activities",
  "published": true
}
```

**Response (200):**
```json
{
  "success": true,
  "plan": {
    "id": "uuid",
    "objectives": "Updated objectives",
    "published": true,
    "updated_at": "2026-05-10T11:00:00Z"
  }
}
```

### Delete Plan

**Endpoint:** `DELETE /lessons/plans/{plan_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Plan deleted"
}
```

---

## Observations

### Create Observation

**Endpoint:** `POST /observations`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "student_id": "uuid",
  "clase_id": "uuid",
  "texto": "Student played with good technique",
  "registrado": true,
  "indicators": ["indicator_1", "indicator_2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "observation": {
    "id": "new-uuid",
    "student_id": "uuid",
    "maestro_id": "uuid",
    "clase_id": "uuid",
    "texto": "Student played with good technique",
    "registrado": true,
    "indicators": ["indicator_1", "indicator_2"],
    "created_at": "2026-05-10T10:00:00Z"
  }
}
```

### List Student Observations

**Endpoint:** `GET /students/{student_id}/observations`

**Query Parameters:**
- `desde` (optional): Start date (ISO 8601)
- `hasta` (optional): End date (ISO 8601)
- `limit` (optional): Max results (default: 20)

**Response (200):**
```json
{
  "success": true,
  "observations": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "maestro_id": "uuid",
      "texto": "Good progress",
      "registrado": true,
      "created_at": "2026-05-10T10:00:00Z"
    }
  ],
  "total": 15
}
```

### Update Observation

**Endpoint:** `PUT /observations/{observation_id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "texto": "Updated observation text",
  "indicators": ["indicator_3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "observation": {
    "id": "uuid",
    "texto": "Updated observation text",
    "updated_at": "2026-05-10T11:00:00Z"
  }
}
```

### Delete Observation

**Endpoint:** `DELETE /observations/{observation_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Observation deleted"
}
```

---

## Evaluations

### Create Evaluation

**Endpoint:** `POST /evaluations`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "student_id": "uuid",
  "route_id": "uuid",
  "period": "2026-Q1",
  "criteria": {
    "technique": 3,
    "theory": 2,
    "engagement": 4
  },
  "comments": "Good progress this quarter"
}
```

**Response (201):**
```json
{
  "success": true,
  "evaluation": {
    "id": "new-uuid",
    "student_id": "uuid",
    "maestro_id": "uuid",
    "period": "2026-Q1",
    "criteria": {
      "technique": 3,
      "theory": 2,
      "engagement": 4
    },
    "created_at": "2026-05-10T10:00:00Z"
  }
}
```

### List Student Evaluations

**Endpoint:** `GET /students/{student_id}/evaluations`

**Query Parameters:**
- `period` (optional): Filter by period
- `limit` (optional): Max results (default: 20)

**Response (200):**
```json
{
  "success": true,
  "evaluations": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "period": "2026-Q1",
      "criteria": {
        "technique": 3,
        "theory": 2,
        "engagement": 4
      },
      "created_at": "2026-05-10T10:00:00Z"
    }
  ],
  "total": 4
}
```

---

## Students

### List My Students

**Endpoint:** `GET /students`

**Query Parameters:**
- `clase_id` (optional): Filter by class
- `route_id` (optional): Filter by route
- `search` (optional): Search by name

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "students": [
    {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "apellido": "Pérez",
      "instrumento": "Violín",
      "route_name": "Iniciación Musical",
      "nivel": 1
    }
  ],
  "total": 25
}
```

### Get Student Details

**Endpoint:** `GET /students/{student_id}`

**Response (200):**
```json
{
  "success": true,
  "student": {
    "id": "uuid",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@email.com",
    "instrumento": "Violín",
    "route": {
      "id": "uuid",
      "name": "Iniciación Musical",
      "level": 1
    },
    "progress": {
      "total_observations": 15,
      "avg_evaluation": 3.2,
      "last_activity": "2026-05-09T14:30:00Z"
    }
  }
}
```

---

## Notifications

### Fetch Notifications

**Endpoint:** `GET /notifications`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Max results (default: 10)
- `offset` (optional): Pagination offset
- `unread_only` (optional): Only unread (default: false)

**Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "tipo": "recordatorio_clase",
      "titulo": "Clase de Iniciación Musical",
      "descripcion": "Comienza en 15 minutos",
      "clase_id": "uuid",
      "leida": false,
      "created_at": "2026-05-10T14:45:00Z"
    }
  ]
}
```

### Mark Notification as Read

**Endpoint:** `PUT /notifications/{notification_id}/read`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "notification": {
    "id": "uuid",
    "leida": true,
    "read_at": "2026-05-10T15:00:00Z"
  }
}
```

### Register Device for Web Push

**Endpoint:** `POST /notifications/push/subscribe`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Device subscribed successfully"
}
```

---

## Audit Logs (Admin Only)

### List Audit Logs

**Endpoint:** `GET /admin/audit-logs`

**Headers:**
```
Authorization: Bearer {token}
X-Admin-Token: {admin_token}
```

**Query Parameters:**
- `user_id` (optional): Filter by user
- `action` (optional): CREATE, UPDATE, DELETE
- `entity` (optional): Table name
- `desde` (optional): Start date
- `hasta` (optional): End date
- `limit` (optional): Default 50

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_email": "maestro@elsistema.pc",
      "action": "CREATE",
      "entity": "observation",
      "entity_id": "uuid",
      "changes": {
        "texto": "Added observation"
      },
      "created_at": "2026-05-10T10:00:00Z"
    }
  ],
  "total": 234
}
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `400` | Bad Request | Check request format and required fields |
| `401` | Unauthorized | Login again or check token validity |
| `403` | Forbidden | Insufficient permissions for this action |
| `404` | Not Found | Resource doesn't exist or was deleted |
| `422` | Validation Error | Check input format and validation rules |
| `429` | Rate Limited | Wait before retrying, max 100 req/min |
| `500` | Server Error | Contact support with error details |
| `503` | Service Unavailable | Try again later |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "constraint": "must be valid email"
    }
  }
}
```

---

## Rate Limiting

All API endpoints are rate-limited:
- **Limit**: 100 requests per minute per user
- **Header**: `X-RateLimit-Remaining` shows remaining requests
- **Header**: `X-RateLimit-Reset` shows reset timestamp

When exceeded, returns `429 Too Many Requests`:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait before retrying.",
    "retry_after": 30
  }
}
```

---

**OpenAPI/Swagger spec:** Coming soon (generated from code)

*Last updated: May 10, 2026*
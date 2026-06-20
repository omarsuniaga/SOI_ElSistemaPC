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
      "created_at": "2026-05-10T14:45:00Z"
    }
  ]
}
```

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

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `401` | Unauthorized | Login again |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `422` | Validation Error | Check input format |
| `429` | Rate Limited | Wait before retrying |
| `500` | Server Error | Contact support |

---

**OpenAPI/Swagger spec:** Coming soon (generated from code)

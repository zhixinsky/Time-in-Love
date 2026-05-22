# NestJS Admin Blueprint

The current runtime API remains Express for compatibility with the mini program. The target NestJS migration should map the admin console to these modules:

- `auth`: JWT login, refresh, current admin profile
- `admin-user`: user search, detail, disable, unban, delete, reset state
- `admin-space`: couple space list/detail/update/dissolve/recommend
- `admin-diary`: diary list/detail/review/delete/recommend/feature
- `admin-album`: album list, media review, preview, batch delete
- `admin-ai`: prompt config, model config, call stats, sensitive words, generation logs
- `admin-review`: review queue, batch approve/reject, reason recording
- `admin-banner`: banner upload, sorting, publish/unpublish
- `admin-config`: app, AI, storage and content config
- `admin-rbac`: roles, page permissions, button permissions, API permissions

Shared requirements:

- `JwtAuthGuard` for every `/admin/*` route except login.
- `RolesGuard` with permission metadata, e.g. `@Permission('diary.review')`.
- DTO validation with `class-validator`.
- Pagination DTO: `page`, `pageSize`, `keyword`, `status`, `dateFrom`, `dateTo`.
- Prisma ORM using `prisma/schema.prisma`.
- Swagger tags per module.

The Express endpoints added in `src/controllers/admin-console-controller.js` are intentionally shaped like the future Nest responses:

```json
{
  "code": 0,
  "data": {
    "list": [],
    "pagination": { "page": 1, "pageSize": 20, "total": 0 }
  }
}
```

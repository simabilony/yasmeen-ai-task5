# توثيق API - نظام إدارة المشاريع والمهام

## نظرة عامة

هذا التوثيق يغطي جميع نقاط النهاية (Endpoints) في نظام إدارة المشاريع والمهام. جميع الطلبات تتطلب مصادقة JWT ما لم يذكر خلاف ذلك.

**Base URL:** `http://127.0.0.1:8000`

## المصادقة (Authentication)

### الحصول على توكن الوصول

```http
POST /api/token/
```

**Request Body:**
```json
{
    "username": "admin",
    "password": "password"
}
```

**Response:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### تجديد التوكن

```http
POST /api/token/refresh/
```

**Request Body:**
```json
{
    "refresh": "your_refresh_token"
}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

## المشاريع (Projects)

### قائمة المشاريع

```http
GET /api/projects/
```

**Query Parameters:**
- `is_active` (boolean): فلترة حسب حالة المشروع
- `manager` (integer): فلترة حسب مدير المشروع
- `search` (string): البحث في العنوان والوصف
- `ordering` (string): ترتيب النتائج

**Response:**
```json
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "title": "مشروع تطوير الموقع",
            "description": "مشروع تطوير موقع إلكتروني متكامل",
            "manager": {
                "id": 1,
                "username": "admin",
                "first_name": "مدير",
                "last_name": "النظام",
                "email": "admin@example.com"
            },
            "members": [
                {
                    "id": 2,
                    "username": "user1",
                    "first_name": "أحمد",
                    "last_name": "محمد",
                    "email": "user1@example.com"
                }
            ],
            "member_count": 3,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "is_active": true
        }
    ]
}
```

### إنشاء مشروع جديد

```http
POST /api/projects/
```

**Request Body:**
```json
{
    "title": "مشروع جديد",
    "description": "وصف المشروع الجديد",
    "members": [2, 3]
}
```

**Response:** `201 Created`

### تفاصيل المشروع

```http
GET /api/projects/{id}/
```

### تحديث المشروع

```http
PUT /api/projects/{id}/
PATCH /api/projects/{id}/
```

**Request Body:**
```json
{
    "title": "مشروع محدث",
    "description": "وصف محدث للمشروع",
    "members": [2, 3, 4],
    "is_active": true
}
```

### حذف المشروع

```http
DELETE /api/projects/{id}/
```

### إضافة عضو للمشروع

```http
POST /api/projects/{id}/add_member/
```

**Request Body:**
```json
{
    "user_id": 5
}
```

### إزالة عضو من المشروع

```http
POST /api/projects/{id}/remove_member/
```

**Request Body:**
```json
{
    "user_id": 5
}
```

### مشاريعي (كمدير)

```http
GET /api/projects/my_projects/
```

### مشاريعي (كعضو)

```http
GET /api/projects/member_projects/
```

## المهام (Tasks)

### قائمة المهام

```http
GET /api/tasks/
```

**Query Parameters:**
- `status` (string): فلترة حسب الحالة (todo, in_progress, done)
- `priority` (string): فلترة حسب الأولوية (low, medium, high, urgent)
- `project` (integer): فلترة حسب المشروع
- `assignee` (integer): فلترة حسب المكلف
- `is_pinned` (boolean): فلترة حسب التثبيت
- `search` (string): البحث في العنوان والوصف
- `ordering` (string): ترتيب النتائج

**Response:**
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "title": "تصميم واجهة المستخدم",
            "description": "تصميم واجهة مستخدم حديثة",
            "project": {
                "id": 1,
                "title": "مشروع تطوير الموقع",
                "description": "مشروع تطوير موقع إلكتروني متكامل",
                "manager": {
                    "id": 1,
                    "username": "admin",
                    "first_name": "مدير",
                    "last_name": "النظام",
                    "email": "admin@example.com"
                },
                "members": [...],
                "member_count": 3,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "is_active": true
            },
            "assignee": {
                "id": 2,
                "username": "user1",
                "first_name": "أحمد",
                "last_name": "محمد",
                "email": "user1@example.com"
            },
            "created_by": {
                "id": 1,
                "username": "admin",
                "first_name": "مدير",
                "last_name": "النظام",
                "email": "admin@example.com"
            },
            "status": "in_progress",
            "priority": "high",
            "due_date": "2024-01-15T00:00:00Z",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "is_pinned": true,
            "followers_count": 2
        }
    ]
}
```

### إنشاء مهمة جديدة

```http
POST /api/tasks/
```

**Request Body:**
```json
{
    "title": "مهمة جديدة",
    "description": "وصف المهمة الجديدة",
    "project": 1,
    "assignee": 2,
    "priority": "high",
    "due_date": "2024-01-15T10:00:00Z"
}
```

### تفاصيل المهمة

```http
GET /api/tasks/{id}/
```

### تحديث المهمة

```http
PUT /api/tasks/{id}/
PATCH /api/tasks/{id}/
```

**Request Body:**
```json
{
    "title": "مهمة محدثة",
    "description": "وصف محدث للمهمة",
    "assignee": 3,
    "status": "in_progress",
    "priority": "urgent",
    "due_date": "2024-01-20T00:00:00Z",
    "is_pinned": true
}
```

### حذف المهمة

```http
DELETE /api/tasks/{id}/
```

### مهامي المكلفة

```http
GET /api/tasks/my_tasks/
```

### مهامي المنشأة

```http
GET /api/tasks/created_tasks/
```

### المهام المتأخرة

```http
GET /api/tasks/overdue_tasks/
```

### المهام المثبتة

```http
GET /api/tasks/pinned_tasks/
```

### تثبيت مهمة

```http
POST /api/tasks/{id}/pin_task/
```

### إلغاء تثبيت مهمة

```http
POST /api/tasks/{id}/unpin_task/
```

## متابعة المهام (Task Followers)

### قائمة المتابعين

```http
GET /api/tasks/followers/
```

**Query Parameters:**
- `task` (integer): فلترة حسب المهمة
- `user` (integer): فلترة حسب المستخدم
- `ordering` (string): ترتيب النتائج

### متابعة مهمة

```http
POST /api/tasks/followers/
```

**Request Body:**
```json
{
    "task": 1
}
```

### إلغاء المتابعة

```http
DELETE /api/tasks/followers/{id}/
```

### مهامي المتابعة

```http
GET /api/tasks/followers/my_followed_tasks/
```

## التعليقات (Comments)

### قائمة التعليقات

```http
GET /api/comments/
```

**Query Parameters:**
- `task` (integer): فلترة حسب المهمة
- `author` (integer): فلترة حسب الكاتب
- `search` (string): البحث في المحتوى
- `ordering` (string): ترتيب النتائج

**Response:**
```json
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "content": "تم البدء في تصميم الواجهة وسأقدم النتائج قريباً",
            "author": {
                "id": 2,
                "username": "user1",
                "first_name": "أحمد",
                "last_name": "محمد",
                "email": "user1@example.com"
            },
            "task": {
                "id": 1,
                "title": "تصميم واجهة المستخدم",
                "description": "تصميم واجهة مستخدم حديثة",
                "project": {...},
                "assignee": {...},
                "created_by": {...},
                "status": "in_progress",
                "priority": "high",
                "due_date": "2024-01-15T00:00:00Z",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "is_pinned": true,
                "followers_count": 2
            },
            "created_at": "2024-01-01T10:00:00Z",
            "updated_at": "2024-01-01T10:00:00Z"
        }
    ]
}
```

### إضافة تعليق

```http
POST /api/comments/
```

**Request Body:**
```json
{
    "content": "تعليق جديد على المهمة",
    "task": 1
}
```

### تفاصيل التعليق

```http
GET /api/comments/{id}/
```

### تحديث التعليق

```http
PUT /api/comments/{id}/
PATCH /api/comments/{id}/
```

**Request Body:**
```json
{
    "content": "تعليق محدث"
}
```

### حذف التعليق

```http
DELETE /api/comments/{id}/
```

## الإشعارات (Notifications)

### قائمة الإشعارات

```http
GET /api/notifications/
```

**Query Parameters:**
- `notification_type` (string): فلترة حسب نوع الإشعار
- `is_read` (boolean): فلترة حسب حالة القراءة
- `ordering` (string): ترتيب النتائج

**Response:**
```json
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "recipient": {
                "id": 2,
                "username": "user1",
                "first_name": "أحمد",
                "last_name": "محمد",
                "email": "user1@example.com"
            },
            "notification_type": "task_assigned",
            "title": "تم تكليفك بمهمة جديدة",
            "message": "تم تكليفك بالمهمة: تصميم واجهة المستخدم",
            "task": {
                "id": 1,
                "title": "تصميم واجهة المستخدم",
                "description": "تصميم واجهة مستخدم حديثة",
                "project": {...},
                "assignee": {...},
                "created_by": {...},
                "status": "in_progress",
                "priority": "high",
                "due_date": "2024-01-15T00:00:00Z",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "is_pinned": true,
                "followers_count": 2
            },
            "comment": null,
            "is_read": false,
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

### تفاصيل الإشعار

```http
GET /api/notifications/{id}/
```

### تحديد الإشعار كمقروء

```http
POST /api/notifications/{id}/mark_as_read/
```

### تحديد الإشعار كغير مقروء

```http
POST /api/notifications/{id}/mark_as_unread/
```

### تحديد جميع الإشعارات كمقروءة

```http
POST /api/notifications/mark_all_as_read/
```

### عدد الإشعارات غير المقروءة

```http
GET /api/notifications/unread_count/
```

**Response:**
```json
{
    "unread_count": 5
}
```

## سجلات المهام (Task Logs)

### سجلات التغييرات

```http
GET /api/notifications/logs/
```

**Query Parameters:**
- `task` (integer): فلترة حسب المهمة
- `user` (integer): فلترة حسب المستخدم
- `log_type` (string): فلترة حسب نوع التغيير
- `ordering` (string): ترتيب النتائج

**Response:**
```json
{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "task": {
                "id": 1,
                "title": "تصميم واجهة المستخدم",
                "description": "تصميم واجهة مستخدم حديثة",
                "project": {...},
                "assignee": {...},
                "created_by": {...},
                "status": "in_progress",
                "priority": "high",
                "due_date": "2024-01-15T00:00:00Z",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "is_pinned": true,
                "followers_count": 2
            },
            "user": {
                "id": 2,
                "username": "user1",
                "first_name": "أحمد",
                "last_name": "محمد",
                "email": "user1@example.com"
            },
            "log_type": "status_changed",
            "old_value": "todo",
            "new_value": "in_progress",
            "created_at": "2024-01-01T09:00:00Z"
        }
    ]
}
```

### تفاصيل السجل

```http
GET /api/notifications/logs/{id}/
```

## أنواع البيانات (Data Types)

### حالات المهام (Task Status)
- `todo`: قيد الانتظار
- `in_progress`: قيد التنفيذ
- `done`: مكتمل

### أولويات المهام (Task Priority)
- `low`: منخفض
- `medium`: متوسط
- `high`: عالي
- `urgent`: عاجل

### أنواع الإشعارات (Notification Types)
- `task_created`: تم إنشاء مهمة جديدة
- `task_updated`: تم تحديث مهمة
- `task_assigned`: تم تكليفك بمهمة
- `comment_added`: تم إضافة تعليق جديد
- `task_followed`: تم متابعة مهمة
- `task_completed`: تم إكمال مهمة

### أنواع السجلات (Log Types)
- `status_changed`: تغيير الحالة
- `assignee_changed`: تغيير المكلف
- `description_changed`: تغيير الوصف
- `priority_changed`: تغيير الأولوية
- `due_date_changed`: تغيير تاريخ التسليم
- `pinned`: تثبيت المهمة
- `unpinned`: إلغاء تثبيت المهمة

## رموز الحالة (Status Codes)

- `200 OK`: الطلب ناجح
- `201 Created`: تم إنشاء المورد بنجاح
- `204 No Content`: تم الحذف بنجاح
- `400 Bad Request`: بيانات الطلب غير صحيحة
- `401 Unauthorized`: غير مصرح (مطلوب مصادقة)
- `403 Forbidden`: ممنوع (غير مصرح بالوصول)
- `404 Not Found`: المورد غير موجود
- `500 Internal Server Error`: خطأ في الخادم

## أمثلة الاستخدام

### مثال 1: إنشاء مشروع ومهام

```bash
# 1. الحصول على توكن
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# 2. إنشاء مشروع
curl -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مشروع تطوير التطبيق",
    "description": "تطوير تطبيق جوال متكامل",
    "members": [2, 3]
  }'

# 3. إنشاء مهمة
curl -X POST http://127.0.0.1:8000/api/tasks/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "تصميم واجهة المستخدم",
    "description": "تصميم واجهة مستخدم حديثة وسهلة الاستخدام",
    "project": 1,
    "assignee": 2,
    "priority": "high",
    "due_date": "2024-01-15T10:00:00Z"
  }'
```

### مثال 2: إدارة التعليقات

```bash
# 1. إضافة تعليق
curl -X POST http://127.0.0.1:8000/api/comments/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "تم البدء في العمل على التصميم",
    "task": 1
  }'

# 2. تحديث التعليق
curl -X PUT http://127.0.0.1:8000/api/comments/1/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "تم البدء في العمل على التصميم وسأقدم النتائج قريباً"
  }'
```

### مثال 3: متابعة المهام والإشعارات

```bash
# 1. متابعة مهمة
curl -X POST http://127.0.0.1:8000/api/tasks/followers/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "task": 1
  }'

# 2. عرض الإشعارات
curl -X GET http://127.0.0.1:8000/api/notifications/ \
  -H "Authorization: Bearer <access_token>"

# 3. تحديد إشعار كمقروء
curl -X POST http://127.0.0.1:8000/api/notifications/1/mark_as_read/ \
  -H "Authorization: Bearer <access_token>"
```

## ملاحظات مهمة

1. **المصادقة**: جميع الطلبات تتطلب header `Authorization: Bearer <access_token>`
2. **الصلاحيات**: المستخدمون يمكنهم الوصول فقط للمشاريع التي يشاركون فيها
3. **الفلترة**: جميع النقاط النهائية تدعم الفلترة والبحث والترتيب
4. **التصفح**: النتائج مقسمة إلى صفحات (20 عنصر في الصفحة)
5. **التواريخ**: جميع التواريخ بصيغة ISO 8601
6. **الترميز**: النص باللغة العربية مدعوم بالكامل

## الدعم

لأي استفسارات حول API:
- راجع ملف README.md
- تحقق من ملف Postman Collection
- اتصل بفريق التطوير 
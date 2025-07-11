# نظام إدارة المشاريع والمهام - Task 6

نظام REST API متكامل لإدارة المشاريع والمهام مع صلاحيات متعددة، تعليقات، متابعة، وإشعارات متقدمة.

## المميزات الرئيسية

### 🔐 نظام المصادقة والصلاحيات
- **JWT Authentication** - نظام توثيق آمن
- **صلاحيات متعددة المستويات** - مدير المشروع، الأعضاء، المكلفين
- **حماية شاملة** - جميع النقاط النهائية محمية

### 📋 إدارة المشاريع
- إنشاء وإدارة المشاريع
- إضافة وإزالة الأعضاء
- صلاحيات واضحة للمدير والأعضاء
- فلترة وبحث متقدم

### ✅ إدارة المهام
- إنشاء وتعديل المهام
- حالات متعددة (قيد الانتظار، قيد التنفيذ، مكتمل)
- أولويات مختلفة (منخفض، متوسط، عالي، عاجل)
- تثبيت المهام المهمة
- تاريخ تسليم قابل للتعديل

### 💬 نظام التعليقات
- إضافة تعليقات على المهام
- تعديل وحذف التعليقات
- صلاحيات خاصة بكاتب التعليق

### 🔔 نظام الإشعارات
- إشعارات فورية للتحديثات
- أنواع متعددة من الإشعارات
- تحديد الإشعارات كمقروءة
- عداد الإشعارات غير المقروءة

### 📊 سجلات التغييرات
- تتبع جميع التغييرات في المهام
- سجل مفصل لكل تعديل
- تاريخ ووقت التغييرات

### 👥 متابعة المهام
- إمكانية متابعة مهام محددة
- تلقي إشعارات بالتحديثات
- إدارة قائمة المهام المتابعة

## التقنيات المستخدمة

### Backend
- **Django 4.2.7** - إطار عمل Python
- **Django REST Framework 3.14.0** - API
- **JWT Authentication** - نظام توثيق آمن
- **SQLite** - قاعدة البيانات (قابل للتغيير إلى PostgreSQL)
- **django-filter** - فلترة البيانات
- **django-cors-headers** - دعم CORS

### Frontend
- **React 18** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة
- **Tailwind CSS** - إطار عمل CSS
- **React Router** - التنقل بين الصفحات
- **React Hook Form** - إدارة النماذج
- **Axios** - طلبات HTTP
- **React Hot Toast** - إشعارات المستخدم

## متطلبات النظام

- Python 3.8+
- pip
- virtualenv (موصى به)

## التثبيت والتشغيل

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd yasmeen-ai-task6
```

### 2. إنشاء البيئة الافتراضية
```bash
python -m venv venv
```

### 3. تفعيل البيئة الافتراضية

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. تثبيت المتطلبات
```bash
pip install -r requirements.txt
```

### 5. إعداد قاعدة البيانات
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. إنشاء مستخدم مدير
```bash
python manage.py createsuperuser
```

### 7. تشغيل الخادم
```bash
python manage.py runserver
```

الخادم سيعمل على: `http://127.0.0.1:8000/`

## تشغيل الواجهة الأمامية (Frontend)

### 1. الانتقال إلى مجلد الواجهة الأمامية
```bash
cd frontend
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. تشغيل التطبيق
```bash
npm start
```

التطبيق سيعمل على: `http://localhost:3000/`

### 4. بناء التطبيق للإنتاج (اختياري)
```bash
npm run build
```

## تشغيل المشروع كاملاً

### 1. تشغيل Backend
```bash
# في مجلد المشروع الرئيسي
python manage.py runserver
```

### 2. تشغيل Frontend
```bash
# في مجلد frontend
npm start
```

### 3. الوصول للتطبيق
- Backend API: `http://localhost:8000/`
- Frontend: `http://localhost:3000/`
- Admin Panel: `http://localhost:8000/admin/`

## API Endpoints

### 🔐 المصادقة
```
POST /api/token/                    # الحصول على توكن الوصول
POST /api/token/refresh/            # تجديد التوكن
```

### 📋 المشاريع
```
GET    /api/projects/               # قائمة المشاريع
POST   /api/projects/               # إنشاء مشروع جديد
GET    /api/projects/{id}/          # تفاصيل المشروع
PUT    /api/projects/{id}/          # تحديث المشروع
DELETE /api/projects/{id}/          # حذف المشروع
POST   /api/projects/{id}/add_member/    # إضافة عضو
POST   /api/projects/{id}/remove_member/ # إزالة عضو
GET    /api/projects/my_projects/   # مشاريعي (كمدير)
GET    /api/projects/member_projects/    # مشاريعي (كعضو)
```

### ✅ المهام
```
GET    /api/tasks/                  # قائمة المهام
POST   /api/tasks/                  # إنشاء مهمة جديدة
GET    /api/tasks/{id}/             # تفاصيل المهمة
PUT    /api/tasks/{id}/             # تحديث المهمة
DELETE /api/tasks/{id}/             # حذف المهمة
GET    /api/tasks/my_tasks/         # مهامي المكلفة
GET    /api/tasks/created_tasks/    # مهامي المنشأة
GET    /api/tasks/overdue_tasks/    # المهام المتأخرة
GET    /api/tasks/pinned_tasks/     # المهام المثبتة
POST   /api/tasks/{id}/pin_task/    # تثبيت مهمة
POST   /api/tasks/{id}/unpin_task/  # إلغاء تثبيت مهمة
```

### 👥 متابعة المهام
```
GET    /api/tasks/followers/        # قائمة المتابعين
POST   /api/tasks/followers/        # متابعة مهمة
DELETE /api/tasks/followers/{id}/   # إلغاء المتابعة
GET    /api/tasks/followers/my_followed_tasks/  # مهامي المتابعة
```

### 💬 التعليقات
```
GET    /api/comments/               # قائمة التعليقات
POST   /api/comments/               # إضافة تعليق
GET    /api/comments/{id}/          # تفاصيل التعليق
PUT    /api/comments/{id}/          # تحديث التعليق
DELETE /api/comments/{id}/          # حذف التعليق
```

### 🔔 الإشعارات
```
GET    /api/notifications/          # قائمة الإشعارات
GET    /api/notifications/{id}/     # تفاصيل الإشعار
POST   /api/notifications/{id}/mark_as_read/     # تحديد كمقروء
POST   /api/notifications/{id}/mark_as_unread/   # تحديد كغير مقروء
POST   /api/notifications/mark_all_as_read/     # تحديد جميعها كمقروءة
GET    /api/notifications/unread_count/         # عدد غير المقروءة
```

### 📊 سجلات المهام
```
GET    /api/notifications/logs/     # سجلات التغييرات
GET    /api/notifications/logs/{id}/ # تفاصيل السجل
```

## أمثلة الاستخدام

### 1. الحصول على توكن الوصول
```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

### 2. إنشاء مشروع جديد
```bash
curl -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مشروع جديد",
    "description": "وصف المشروع",
    "members": [2, 3]
  }'
```

### 3. إنشاء مهمة جديدة
```bash
curl -X POST http://127.0.0.1:8000/api/tasks/ \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مهمة جديدة",
    "description": "وصف المهمة",
    "project": 1,
    "assignee": 2,
    "priority": "high",
    "due_date": "2024-01-15T10:00:00Z"
  }'
```

### 4. إضافة تعليق
```bash
curl -X POST http://127.0.0.1:8000/api/comments/ \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "تعليق جديد",
    "task": 1
  }'
```

## استخدام الواجهة الأمامية

### 1. تسجيل الدخول
- افتح المتصفح وانتقل إلى `http://localhost:3000`
- اضغط على "إنشاء حساب جديد" أو "تسجيل الدخول"
- أدخل بيانات المستخدم

### 2. إدارة المشاريع
- من القائمة الجانبية، اختر "المشاريع"
- اضغط على "إنشاء مشروع جديد" لإضافة مشروع
- اضغط على أي مشروع لعرض تفاصيله

### 3. إدارة المهام
- من القائمة الجانبية، اختر "المهام"
- اضغط على "إنشاء مهمة جديدة" لإضافة مهمة
- اضغط على أي مهمة لعرض تفاصيلها والتعليقات

### 4. التعليقات والإشعارات
- في صفحة تفاصيل المهمة، يمكنك إضافة تعليقات
- ستظهر الإشعارات في الشريط العلوي
- اضغط على أيقونة الإشعارات لعرضها

### 5. متابعة المهام
- في صفحة تفاصيل المهمة، اضغط على "متابعة" لتلقي إشعارات بالتحديثات
- يمكنك عرض المهام المتابعة من لوحة التحكم

### 6. الملف الشخصي
- من القائمة العلوية، اضغط على "الملف الشخصي"
- يمكنك تعديل بياناتك الشخصية وتغيير كلمة المرور

## ميزات الواجهة الأمامية

### 🎨 تصميم حديث ومتجاوب
- واجهة مستخدم جميلة ومتجاوبة مع جميع الأجهزة
- دعم كامل للغة العربية مع اتجاه RTL
- ألوان متناسقة وتصميم عصري

### 🔐 نظام مصادقة متكامل
- صفحات تسجيل دخول وتسجيل حساب جديد
- إدارة التوكن تلقائياً
- حماية الصفحات للمستخدمين المسجلين فقط

### 📊 لوحة تحكم تفاعلية
- إحصائيات مباشرة للمشاريع والمهام
- عرض المشاريع والمهام الحديثة
- روابط سريعة للوصول للوظائف المختلفة

### 📋 إدارة المشاريع
- عرض قائمة المشاريع مع البحث والفلترة
- إضافة مشاريع جديدة
- تفاصيل المشروع مع إدارة الأعضاء
- إضافة مهام للمشروع

### ✅ إدارة المهام
- عرض قائمة المهام مع فلترة متقدمة
- إضافة مهام جديدة
- تفاصيل المهمة مع التعليقات
- تغيير حالة المهمة والأولوية
- تثبيت المهام المهمة

### 💬 نظام التعليقات
- إضافة تعليقات على المهام
- تعديل وحذف التعليقات (لصاحب التعليق)
- عرض تاريخ التعليق والكاتب

### 🔔 نظام الإشعارات
- عرض جميع الإشعارات
- فلترة الإشعارات (مقروءة/غير مقروءة)
- تحديد الإشعارات كمقروءة
- إحصائيات الإشعارات

### 👤 الملف الشخصي
- عرض المعلومات الشخصية
- تعديل البيانات الشخصية
- تغيير كلمة المرور
- إحصائيات الحساب

## الفلترة والبحث

### فلترة المشاريع
```
GET /api/projects/?is_active=true
GET /api/projects/?manager=1
GET /api/projects/?search=مشروع
```

### فلترة المهام
```
GET /api/tasks/?status=todo
GET /api/tasks/?priority=high
GET /api/tasks/?assignee=2
GET /api/tasks/?project=1
GET /api/tasks/?is_pinned=true
GET /api/tasks/?search=مهمة
```

### ترتيب النتائج
```
GET /api/tasks/?ordering=-created_at
GET /api/tasks/?ordering=due_date
GET /api/projects/?ordering=title
```

## الصلاحيات

### مدير المشروع
- ✅ إنشاء وتعديل وحذف المشروع
- ✅ إضافة وإزالة الأعضاء
- ✅ إنشاء وتعديل وحذف المهام
- ✅ إدارة جميع التعليقات

### عضو المشروع
- ✅ عرض المشروع والمهام
- ✅ إضافة تعليقات
- ✅ متابعة المهام
- ✅ عرض الإشعارات

### المكلف بالمهمة
- ✅ تعديل المهمة المكلف بها
- ✅ تغيير حالة المهمة
- ✅ إضافة تعليقات

## الاختبارات

تشغيل الاختبارات:
```bash
python manage.py test
```

الاختبارات تغطي:
- ✅ إنشاء المشاريع والمهام
- ✅ صلاحيات الوصول
- ✅ الفلترة والبحث
- ✅ نظام التعليقات
- ✅ نظام الإشعارات
- ✅ متابعة المهام

## الإدارة

الوصول إلى لوحة الإدارة:
```
http://127.0.0.1:8000/admin/
```

## التخصيص

### تغيير قاعدة البيانات
في `project_management/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### إعدادات JWT
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    # ... المزيد من الإعدادات
}
```

## المساهمة

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الدعم

لأي استفسارات أو مشاكل:
- إنشاء Issue في GitHub
- التواصل عبر البريد الإلكتروني

---
# دليل النشر - نظام إدارة المشاريع والمهام

## نظرة عامة

هذا الدليل يوضح كيفية نشر نظام إدارة المشاريع والمهام في بيئة الإنتاج.

## المتطلبات الأساسية

### الخادم
- Ubuntu 20.04 LTS أو أحدث
- 2GB RAM على الأقل
- 20GB مساحة تخزين
- Python 3.11+

### البرامج المطلوبة
- Docker & Docker Compose
- Git
- Nginx (اختياري)
- PostgreSQL (اختياري)
- Redis (اختياري)

## النشر باستخدام Docker (موصى به)

### 1. إعداد الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# إضافة المستخدم لمجموعة Docker
sudo usermod -aG docker $USER

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# إعادة تشغيل الجلسة
newgrp docker
```

### 2. استنساخ المشروع

```bash
# استنساخ المشروع
git clone <repository-url>
cd yasmeen-ai-task6

# إنشاء ملف البيئة
cp .env.example .env
```

### 3. تعديل ملف البيئة

```bash
# تعديل ملف .env
nano .env
```

```env
# إعدادات Django
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# إعدادات قاعدة البيانات
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=db
DB_PORT=5432

# إعدادات CORS
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# إعدادات البريد الإلكتروني
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# إعدادات Redis
REDIS_URL=redis://redis:6379/1
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

### 4. تشغيل التطبيق

```bash
# بناء وتشغيل الحاويات
docker-compose up -d --build

# مراقبة السجلات
docker-compose logs -f

# إنشاء مستخدم مدير
docker-compose exec web python manage.py createsuperuser

# تحميل البيانات الأولية
docker-compose exec web python manage.py loaddata fixtures/initial_data.json
```

### 5. إعداد Nginx (اختياري)

```bash
# إنشاء ملف إعدادات Nginx
sudo nano /etc/nginx/sites-available/project-management
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/project-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## النشر التقليدي (بدون Docker)

### 1. إعداد الخادم

```bash
# تثبيت المتطلبات
sudo apt update
sudo apt install python3 python3-pip python3-venv postgresql postgresql-contrib redis-server nginx

# إنشاء مستخدم للتطبيق
sudo adduser projectuser
sudo usermod -aG sudo projectuser
```

### 2. إعداد قاعدة البيانات

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# إنشاء قاعدة البيانات والمستخدم
CREATE DATABASE project_management;
CREATE USER projectuser WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE project_management TO projectuser;
\q
```

### 3. إعداد التطبيق

```bash
# الدخول كمستخدم التطبيق
sudo su - projectuser

# استنساخ المشروع
git clone <repository-url>
cd yasmeen-ai-task6

# إنشاء البيئة الافتراضية
python3 -m venv venv
source venv/bin/activate

# تثبيت المتطلبات
pip install -r requirements.txt

# إنشاء ملف البيئة
cp .env.example .env
nano .env
```

### 4. إعداد Django

```bash
# تشغيل الهجرات
python manage.py migrate

# إنشاء مستخدم مدير
python manage.py createsuperuser

# جمع الملفات الثابتة
python manage.py collectstatic

# تحميل البيانات الأولية
python manage.py loaddata fixtures/initial_data.json
```

### 5. إعداد Gunicorn

```bash
# إنشاء ملف خدمة Gunicorn
sudo nano /etc/systemd/system/project-management.service
```

```ini
[Unit]
Description=Project Management Gunicorn
After=network.target

[Service]
User=projectuser
Group=www-data
WorkingDirectory=/home/projectuser/yasmeen-ai-task6
Environment="PATH=/home/projectuser/yasmeen-ai-task6/venv/bin"
ExecStart=/home/projectuser/yasmeen-ai-task6/venv/bin/gunicorn --workers 3 --bind unix:/home/projectuser/yasmeen-ai-task6/project-management.sock project_management.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# تفعيل الخدمة
sudo systemctl start project-management
sudo systemctl enable project-management
```

### 6. إعداد Celery

```bash
# إنشاء ملف خدمة Celery
sudo nano /etc/systemd/system/project-management-celery.service
```

```ini
[Unit]
Description=Project Management Celery Worker
After=network.target

[Service]
Type=forking
User=projectuser
Group=www-data
WorkingDirectory=/home/projectuser/yasmeen-ai-task6
Environment="PATH=/home/projectuser/yasmeen-ai-task6/venv/bin"
ExecStart=/home/projectuser/yasmeen-ai-task6/venv/bin/celery -A project_management worker -l info
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
# تفعيل الخدمة
sudo systemctl start project-management-celery
sudo systemctl enable project-management-celery
```

### 7. إعداد Nginx

```bash
# إنشاء ملف إعدادات Nginx
sudo nano /etc/nginx/sites-available/project-management
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/projectuser/yasmeen-ai-task6;
    }
    
    location /media/ {
        root /home/projectuser/yasmeen-ai-task6;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/projectuser/yasmeen-ai-task6/project-management.sock;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/project-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## إعداد SSL (HTTPS)

### باستخدام Let's Encrypt

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# تجديد تلقائي
sudo crontab -e
# إضافة السطر التالي:
0 12 * * * /usr/bin/certbot renew --quiet
```

## النسخ الاحتياطي

### إنشاء سكريبت النسخ الاحتياطي

```bash
# إنشاء سكريبت النسخ الاحتياطي
nano backup.sh
```

```bash
#!/bin/bash

# إعدادات النسخ الاحتياطي
BACKUP_DIR="/home/projectuser/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="project_management"
DB_USER="projectuser"

# إنشاء مجلد النسخ الاحتياطي
mkdir -p $BACKUP_DIR

# نسخ قاعدة البيانات
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# نسخ الملفات
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz \
    --exclude='venv' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    /home/projectuser/yasmeen-ai-task6

# حذف النسخ الاحتياطية القديمة (أكثر من 7 أيام)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "تم إنشاء النسخ الاحتياطي: $DATE"
```

```bash
# جعل السكريبت قابل للتنفيذ
chmod +x backup.sh

# إضافة إلى Cron للتشغيل اليومي
crontab -e
# إضافة السطر التالي:
0 2 * * * /home/projectuser/yasmeen-ai-task6/backup.sh
```

## المراقبة والصيانة

### مراقبة السجلات

```bash
# مراقبة سجلات Django
tail -f /home/projectuser/yasmeen-ai-task6/logs/django.log

# مراقبة سجلات Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# مراقبة سجلات النظام
sudo journalctl -u project-management -f
sudo journalctl -u project-management-celery -f
```

### تحديث التطبيق

```bash
# إيقاف الخدمات
sudo systemctl stop project-management
sudo systemctl stop project-management-celery

# تحديث الكود
cd /home/projectuser/yasmeen-ai-task6
git pull origin main

# تحديث المتطلبات
source venv/bin/activate
pip install -r requirements.txt

# تشغيل الهجرات
python manage.py migrate

# جمع الملفات الثابتة
python manage.py collectstatic --noinput

# إعادة تشغيل الخدمات
sudo systemctl start project-management
sudo systemctl start project-management-celery
```

## استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في الاتصال بقاعدة البيانات**
   ```bash
   # فحص حالة PostgreSQL
   sudo systemctl status postgresql
   
   # فحص الاتصال
   psql -U projectuser -d project_management -h localhost
   ```

2. **خطأ في Redis**
   ```bash
   # فحص حالة Redis
   sudo systemctl status redis
   
   # اختبار الاتصال
   redis-cli ping
   ```

3. **خطأ في Celery**
   ```bash
   # فحص حالة Celery
   sudo systemctl status project-management-celery
   
   # تشغيل Celery يدوياً للاختبار
   celery -A project_management worker -l info
   ```

4. **خطأ في Nginx**
   ```bash
   # فحص إعدادات Nginx
   sudo nginx -t
   
   # فحص حالة Nginx
   sudo systemctl status nginx
   ```

## الأمان

### إعدادات الأمان الأساسية

1. **تحديث النظام بانتظام**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **إعداد جدار الحماية**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

3. **تغيير كلمات المرور بانتظام**
   ```bash
   # تغيير كلمة مرور قاعدة البيانات
   sudo -u postgres psql
   ALTER USER projectuser PASSWORD 'new-password';
   \q
   ```

4. **مراقبة السجلات للأمان**
   ```bash
   # مراقبة محاولات الدخول الفاشلة
   sudo tail -f /var/log/auth.log | grep "Failed password"
   ```

## الدعم

للمساعدة في النشر أو استكشاف الأخطاء:
- راجع ملف README.md
- تحقق من سجلات الأخطاء
- اتصل بفريق التطوير 
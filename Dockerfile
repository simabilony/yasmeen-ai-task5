# استخدام Python 3.11 كصورة أساسية
FROM python:3.11-slim

# تعيين متغيرات البيئة
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# تعيين مجلد العمل
WORKDIR /app

# تثبيت المتطلبات النظامية
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# نسخ ملف المتطلبات
COPY requirements.txt .

# تثبيت متطلبات Python
RUN pip install --no-cache-dir -r requirements.txt

# نسخ كود المشروع
COPY . .

# إنشاء مجلدات مطلوبة
RUN mkdir -p /app/logs /app/media /app/staticfiles

# جمع الملفات الثابتة
RUN python manage.py collectstatic --noinput

# إنشاء مستخدم غير root
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# تعريض المنفذ
EXPOSE 8000

# أمر تشغيل التطبيق
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "project_management.wsgi:application"] 
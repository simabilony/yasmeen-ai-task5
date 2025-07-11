import time
from django.db import connections
from django.db.utils import OperationalError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """أمر لانتظار قاعدة البيانات حتى تصبح جاهزة"""

    def handle(self, *args, **options):
        self.stdout.write('انتظار قاعدة البيانات...')
        db_conn = None
        while not db_conn:
            try:
                db_conn = connections['default']
                db_conn.cursor()
            except OperationalError:
                self.stdout.write('قاعدة البيانات غير جاهزة، انتظار ثانية واحدة...')
                time.sleep(1)

        self.stdout.write(self.style.SUCCESS('قاعدة البيانات جاهزة!')) 
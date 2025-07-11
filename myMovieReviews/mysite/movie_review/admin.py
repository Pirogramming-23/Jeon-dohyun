from django.contrib import admin
from .models import Review

# Register your models here.
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['title', 'genre', 'rating', 'release_year', 'created_at']  # 목록에서 보여줄 필드들
    list_filter = ['genre', 'rating', 'release_year']  # 필터링 옵션
    search_fields = ['title', 'director', 'actors']  # 검색 가능한 필드들
    ordering = ['-created_at']  # 최신순으로 정렬

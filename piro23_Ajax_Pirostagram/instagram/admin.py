from django.contrib import admin
from .models import UserProfile, Post, PostImage, Comment, Reply


class PostImageInline(admin.TabularInline):
    """
    게시글 이미지를 게시글 생성/수정 페이지에서 인라인으로 관리
    """
    model = PostImage
    extra = 1  # 추가로 보여줄 빈 폼 개수
    fields = ('image', 'order')


class CommentInline(admin.TabularInline):
    """
    댓글을 게시글 생성/수정 페이지에서 인라인으로 관리
    """
    model = Comment
    extra = 0  # 빈 폼은 보여주지 않음
    fields = ('author', 'content', 'created_at')
    readonly_fields = ('created_at',)


class ReplyInline(admin.TabularInline):
    """
    대댓글을 댓글 생성/수정 페이지에서 인라인으로 관리
    """
    model = Reply
    extra = 0
    fields = ('author', 'content', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    사용자 프로필 관리자 설정
    """
    list_display = ('user', 'bio', 'created_at')  # 목록에서 보여줄 필드들
    list_filter = ('created_at',)  # 필터 옵션
    search_fields = ('user__username', 'user__email', 'bio')  # 검색 가능한 필드들
    readonly_fields = ('created_at',)  # 읽기 전용 필드


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    게시글 관리자 설정
    """
    list_display = ('author', 'content_preview', 'total_likes', 'total_comments', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('author__username', 'content')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PostImageInline, CommentInline]  # 인라인으로 보여줄 모델들
    
    def content_preview(self, obj):
        """게시글 내용 미리보기 (30자까지만)"""
        return obj.content[:30] + "..." if len(obj.content) > 30 else obj.content
    content_preview.short_description = "내용 미리보기"


@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    """
    게시글 이미지 관리자 설정
    """
    list_display = ('post', 'image', 'order')
    list_filter = ('post__created_at',)
    search_fields = ('post__author__username', 'post__content')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    댓글 관리자 설정
    """
    list_display = ('author', 'post', 'content_preview', 'total_replies', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('author__username', 'post__author__username', 'content')
    readonly_fields = ('created_at',)
    inlines = [ReplyInline]
    
    def content_preview(self, obj):
        """댓글 내용 미리보기 (20자까지만)"""
        return obj.content[:20] + "..." if len(obj.content) > 20 else obj.content
    content_preview.short_description = "내용 미리보기"


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    """
    대댓글 관리자 설정
    """
    list_display = ('author', 'comment', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('author__username', 'comment__author__username', 'content')
    readonly_fields = ('created_at',)
    
    def content_preview(self, obj):
        """대댓글 내용 미리보기 (20자까지만)"""
        return obj.content[:20] + "..." if len(obj.content) > 20 else obj.content
    content_preview.short_description = "내용 미리보기"

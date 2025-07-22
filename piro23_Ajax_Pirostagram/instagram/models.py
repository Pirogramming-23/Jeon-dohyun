from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    """
    사용자 프로필 모델 - User 모델을 확장하여 추가 정보 저장
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="사용자")
    bio = models.TextField(max_length=500, blank=True, verbose_name="자기소개")
    profile_image = models.ImageField(
        upload_to='profile_images/', 
        blank=True, 
        null=True, 
        verbose_name="프로필 이미지"
    )
    followers = models.ManyToManyField(
        'self', 
        symmetrical=False, 
        related_name='following', 
        blank=True, 
        verbose_name="팔로워들"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="가입일")

    def __str__(self):
        return f"{self.user.username}의 프로필"

    class Meta:
        verbose_name = "사용자 프로필"
        verbose_name_plural = "사용자 프로필들"


class Post(models.Model):
    """
    게시글 모델 - 사용자가 올리는 피드 게시물
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="작성자")
    content = models.TextField(verbose_name="게시글 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    likes = models.ManyToManyField(
        User, 
        related_name='liked_posts', 
        blank=True, 
        verbose_name="좋아요한 사용자들"
    )

    def __str__(self):
        return f"{self.author.username}의 게시글 - {self.content[:30]}"

    def total_likes(self):
        """총 좋아요 수 반환"""
        return self.likes.count()

    def total_comments(self):
        """총 댓글 수 반환 (대댓글 포함)"""
        return self.comments.count()

    class Meta:
        verbose_name = "게시글"
        verbose_name_plural = "게시글들"
        ordering = ['-created_at']  # 최신순으로 정렬


class PostImage(models.Model):
    """
    게시글 이미지 모델 - 하나의 게시글에 여러 이미지 업로드 가능
    """
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='images', 
        verbose_name="게시글"
    )
    image = models.ImageField(upload_to='post_images/', verbose_name="이미지")
    order = models.PositiveIntegerField(default=0, verbose_name="이미지 순서")

    def __str__(self):
        return f"{self.post.author.username}의 게시글 이미지 {self.order + 1}"

    class Meta:
        verbose_name = "게시글 이미지"
        verbose_name_plural = "게시글 이미지들"
        ordering = ['order']  # 순서대로 정렬


class Comment(models.Model):
    """
    댓글 모델 - 게시글에 달리는 댓글
    """
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='comments', 
        verbose_name="게시글"
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="작성자")
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일")

    def __str__(self):
        return f"{self.author.username}: {self.content[:20]}"

    def total_replies(self):
        """해당 댓글에 달린 대댓글 수 반환"""
        return self.replies.count()

    class Meta:
        verbose_name = "댓글"
        verbose_name_plural = "댓글들"
        ordering = ['created_at']  # 작성순으로 정렬


class Reply(models.Model):
    """
    대댓글 모델 - 댓글에 달리는 답글
    """
    comment = models.ForeignKey(
        Comment, 
        on_delete=models.CASCADE, 
        related_name='replies', 
        verbose_name="댓글"
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="작성자")
    content = models.TextField(verbose_name="대댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일")

    def __str__(self):
        return f"{self.author.username}의 대댓글: {self.content[:20]}"

    class Meta:
        verbose_name = "대댓글"
        verbose_name_plural = "대댓글들"
        ordering = ['created_at']  # 작성순으로 정렬

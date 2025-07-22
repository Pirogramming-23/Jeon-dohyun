from django.urls import path
from . import views

app_name = 'instagram'

urlpatterns = [
    # 메인 페이지
    path('', views.home, name='home'),
    
    # 게시글 관련
    path('post/create/', views.post_create, name='post_create'),
    
    # Ajax API 엔드포인트들
    path('api/post/like/', views.post_like_toggle, name='post_like_toggle'),
    path('api/comment/create/', views.comment_create, name='comment_create'),
    path('api/comment/delete/', views.comment_delete, name='comment_delete'),
    path('api/reply/create/', views.reply_create, name='reply_create'),
    path('api/reply/delete/', views.reply_delete, name='reply_delete'),
    
    # 검색 관련 Ajax API
    path('api/search/posts/', views.search_posts, name='search_posts'),
    path('api/search/users/', views.search_users, name='search_users'),
] 
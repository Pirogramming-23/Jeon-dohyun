from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.contrib import messages
import json

from .models import Post, PostImage, Comment, Reply, UserProfile


def home(request):
    """
    메인 홈 페이지 - 전체 게시글 피드 표시
    """
    # 게시글들을 최신순으로 가져오기 
    posts_list = Post.objects.all().order_by('-created_at')
    
    # 정렬 옵션 처리
    sort_option = request.GET.get('sort', 'latest')
    if sort_option == 'likes':
        # 좋아요 수 기준 정렬 
        posts_list = Post.objects.annotate(num_likes=Count('likes')).order_by('-num_likes', '-created_at')
    elif sort_option == 'comments':
        # 댓글 수 기준 정렬 
        posts_list = Post.objects.annotate(num_comments=Count('comments')).order_by('-num_comments', '-created_at')
    
    # 검색 기능
    search_query = request.GET.get('search', '')
    if search_query:
        posts_list = posts_list.filter(
            Q(content__icontains=search_query) |
            Q(author__username__icontains=search_query)
        )
    
    # 페이지네이션 (한 페이지에 5개씩)
    paginator = Paginator(posts_list, 5)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)
    
    context = {
        'posts': posts,
        'search_query': search_query,
        'sort_option': sort_option,
    }
    return render(request, 'instagram/home.html', context)


@login_required
def post_create(request):
    """
    게시글 작성 페이지
    """
    if request.method == 'POST':
        content = request.POST.get('content')
        images = request.FILES.getlist('images')  # 여러 이미지 파일 받기
        
        if content:
            # 게시글 생성
            post = Post.objects.create(
                author=request.user,
                content=content
            )
            
            # 이미지들 저장
            for i, image in enumerate(images):
                PostImage.objects.create(
                    post=post,
                    image=image,
                    order=i
                )
            
            messages.success(request, '게시글이 성공적으로 작성되었습니다!')
            return redirect('instagram:home')
        else:
            messages.error(request, '게시글 내용을 입력해주세요.')
    
    return render(request, 'instagram/post_create.html')


@login_required
@require_POST
def post_like_toggle(request):
    """
    Ajax - 게시글 좋아요 토글 기능
    """
    try:
        data = json.loads(request.body)
        post_id = data.get('post_id')
        post = get_object_or_404(Post, id=post_id)
        
        # 이미 좋아요를 눌렀는지 확인
        if request.user in post.likes.all():
            # 좋아요 취소
            post.likes.remove(request.user)
            liked = False
        else:
            # 좋아요 추가
            post.likes.add(request.user)
            liked = True
        
        return JsonResponse({
            'status': 'success',
            'liked': liked,
            'total_likes': post.total_likes()
        })
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


@login_required
@require_POST
def comment_create(request):
    """
    Ajax - 댓글 작성 기능
    """
    try:
        data = json.loads(request.body)
        post_id = data.get('post_id')
        content = data.get('content')
        
        if not content.strip():
            return JsonResponse({
                'status': 'error',
                'message': '댓글 내용을 입력해주세요.'
            }, status=400)
        
        post = get_object_or_404(Post, id=post_id)
        
        # 댓글 생성
        comment = Comment.objects.create(
            post=post,
            author=request.user,
            content=content.strip()
        )
        
        return JsonResponse({
            'status': 'success',
            'comment': {
                'id': comment.id,
                'author': comment.author.username,
                'content': comment.content,
                'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M'),
                'total_replies': comment.total_replies()
            }
        })
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


@login_required
@require_POST
def comment_delete(request):
    """
    Ajax - 댓글 삭제 기능
    """
    try:
        data = json.loads(request.body)
        comment_id = data.get('comment_id')
        
        comment = get_object_or_404(Comment, id=comment_id)
        
        # 댓글 작성자만 삭제 가능
        if comment.author != request.user:
            return JsonResponse({
                'status': 'error',
                'message': '댓글을 삭제할 권한이 없습니다.'
            }, status=403)
        
        comment.delete()
        
        return JsonResponse({
            'status': 'success',
            'message': '댓글이 삭제되었습니다.'
        })
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


@login_required
@require_POST
def reply_create(request):
    """
    Ajax - 대댓글 작성 기능
    """
    try:
        data = json.loads(request.body)
        comment_id = data.get('comment_id')
        content = data.get('content')
        
        if not content.strip():
            return JsonResponse({
                'status': 'error',
                'message': '대댓글 내용을 입력해주세요.'
            }, status=400)
        
        comment = get_object_or_404(Comment, id=comment_id)
        
        # 대댓글 생성
        reply = Reply.objects.create(
            comment=comment,
            author=request.user,
            content=content.strip()
        )
        
        return JsonResponse({
            'status': 'success',
            'reply': {
                'id': reply.id,
                'author': reply.author.username,
                'content': reply.content,
                'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
            }
        })
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


@login_required
@require_POST
def reply_delete(request):
    """
    Ajax - 대댓글 삭제 기능
    """
    try:
        data = json.loads(request.body)
        reply_id = data.get('reply_id')
        
        reply = get_object_or_404(Reply, id=reply_id)
        
        # 대댓글 작성자만 삭제 가능
        if reply.author != request.user:
            return JsonResponse({
                'status': 'error',
                'message': '대댓글을 삭제할 권한이 없습니다.'
            }, status=403)
        
        reply.delete()
        
        return JsonResponse({
            'status': 'success',
            'message': '대댓글이 삭제되었습니다.'
        })
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


def search_posts(request):
    """
    Ajax - 게시글 실시간 검색 기능
    """
    search_query = request.GET.get('q', '')
    
    if search_query:
        posts = Post.objects.filter(
            Q(content__icontains=search_query) |
            Q(author__username__icontains=search_query)
        ).order_by('-created_at')[:10]  # 최대 10개까지만
        
        posts_data = []
        for post in posts:
            posts_data.append({
                'id': post.id,
                'author': post.author.username,
                'content': post.content[:100],  # 100자까지만
                'total_likes': post.total_likes(),
                'total_comments': post.total_comments(),
                'created_at': post.created_at.strftime('%Y-%m-%d %H:%M')
            })
        
        return JsonResponse({
            'status': 'success',
            'posts': posts_data
        })
    
    return JsonResponse({
        'status': 'success',
        'posts': []
    })


def search_users(request):
    """
    Ajax - 유저 검색 기능
    """
    search_query = request.GET.get('q', '')
    
    if search_query:
        users = User.objects.filter(
            username__icontains=search_query
        )[:10]  # 최대 10명까지만
        
        users_data = []
        for user in users:
            try:
                profile = user.userprofile
                profile_image = profile.profile_image.url if profile.profile_image else None
            except UserProfile.DoesNotExist:
                profile_image = None
            
            users_data.append({
                'id': user.id,
                'username': user.username,
                'profile_image': profile_image
            })
        
        return JsonResponse({
            'status': 'success',
            'users': users_data
        })
    
    return JsonResponse({
        'status': 'success',
        'users': []
    })

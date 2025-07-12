from django.shortcuts import render, redirect, get_object_or_404
from .models import Review

# Create your views here.
def review_list(request):
    reviews = Review.objects.all()
    
    # 각 리뷰에 별점 정보 추가
    for review in reviews:
        review.stars_filled = range(review.rating)  # 채워진 별
        review.stars_empty = range(5 - review.rating)  # 빈 별
    
    context = {
        "reviews" : reviews
    }
    return render(request, "review_list.html", context)

def review_detail(request, review_id):
    review = Review.objects.get(id = review_id)
    
    # 별점 정보 추가
    review.stars_filled = range(review.rating)  # 채워진 별
    review.stars_empty = range(5 - review.rating)  # 빈 별
    
    context = {
        "review" : review
    }
    return render(request, "review_detail.html", context)

# 새 리뷰 작성
def review_create(request):
    if request.method == 'POST':
        # 폼 데이터 받기
        title = request.POST.get('title')
        director = request.POST.get('director')
        actors = request.POST.get('actors')
        genre = request.POST.get('genre')
        rating = int(request.POST.get('rating'))
        running_time = int(request.POST.get('running_time'))
        content = request.POST.get('content')
        release_year = int(request.POST.get('release_year'))
        
        # 새 리뷰 생성
        Review.objects.create(
            title=title,
            director=director,
            actors=actors,
            genre=genre,
            rating=rating,
            running_time=running_time,
            content=content,
            release_year=release_year
        )
        
        # 새 리뷰 작성 후 저장 → 리뷰 리스트 페이지로 이동
        return redirect('review_list')
    
    # GET 요청일 때는 빈 폼 표시
    return render(request, "review_form.html")

# 기존 리뷰 수정
def review_edit(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    
    if request.method == 'POST':
        # 폼 데이터로 리뷰 업데이트
        review.title = request.POST.get('title')
        review.director = request.POST.get('director')
        review.actors = request.POST.get('actors')
        review.genre = request.POST.get('genre')
        review.rating = int(request.POST.get('rating'))
        review.running_time = int(request.POST.get('running_time'))
        review.content = request.POST.get('content')
        review.release_year = int(request.POST.get('release_year'))
        review.save()
        
        # 리뷰 수정 후 저장 → 수정한 해당 리뷰 디테일 페이지로 이동
        return redirect('review_detail', review_id=review.id)
    
    # GET 요청일 때는 기존 데이터로 채워진 폼 표시
    context = {'review': review}
    return render(request, "review_form.html", context)

# 리뷰 삭제
def review_delete(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    
    if request.method == 'POST':
        review.delete()
        # 삭제 후 리뷰 리스트 페이지로 이동
        return redirect('review_list')
from django.db import models

# Create your models here.
class Review(models.Model):
    title = models.CharField(max_length=100) # 짧은 텍스트
    director = models.CharField(max_length=100)
    actors = models.TextField()
    genre = models.CharField(max_length=50)
    rating = models.IntegerField() # 별점 1~5점 정수
    running_time = models.IntegerField() # 정수(분단위)
    content = models.TextField()
    release_year = models.IntegerField() 
    created_at = models.DateTimeField(auto_now_add=True)
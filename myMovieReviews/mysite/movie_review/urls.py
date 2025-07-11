from django.urls import path
from .views import *

urlpatterns = [
    path('', review_list, name='review_list'),
    path('review/<int:review_id>/', review_detail, name='review_detail'),
    path('review/new/', review_create, name='review_create'),
    path('review/<int:review_id>/edit/', review_edit, name='review_edit'),
    path('review/<int:review_id>/delete/', review_delete, name='review_delete'),
]
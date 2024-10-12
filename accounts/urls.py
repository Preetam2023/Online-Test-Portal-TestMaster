from django.urls import path
from .views import home, login_view, signup,dashboard
urlpatterns = [
    path('signup/', signup, name='signup'),
    path('', home, name='home'), 
    path('login/', login_view, name='login'),
    path('dashboard/', dashboard, name='dashboard'),
]

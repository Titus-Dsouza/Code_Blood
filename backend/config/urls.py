from django.urls import path
from api import views

urlpatterns = [
    path("health", views.health), path("api", views.api_root),
    path("api/v1/health", views.firebase_health),
    path("api/v1/account/signup", views.signup), path("api/v1/account/me", views.account_me),
    path("api/v1/employee/profile", views.employee_profile), path("api/v1/employee/summary", views.employee_summary),
    path("api/v1/employee/skill-gaps", views.skill_gaps), path("api/v1/employee/jobs/<str:job_id>/apply", views.apply_job),
    path("api/v1/employee/hiring-requests", views.employee_hiring_requests), path("api/v1/employee/hiring-requests/<str:request_id>", views.update_hiring_request),
    path("api/v1/employer/profile", views.employer_profile), path("api/v1/employer/requirements", views.requirements),
    path("api/v1/employer/jobs", views.jobs_create), path("api/v1/employer/matches", views.matches),
    path("api/v1/employer/summary", views.employer_summary), path("api/v1/employer/hiring-requests", views.employer_hiring_requests),
    path("api/v1/employer/hiring-requests/<str:request_id>", views.cancel_hiring_request),
    path("api/v1/jobs", views.jobs), path("api/v1/skills", views.skills), path("api/v1/learning/resources", views.learning),
    path("api/v1/insights/demand", views.demand), path("api/v1/logisky", views.logisky),
    path("api/v1/news", views.news),
]

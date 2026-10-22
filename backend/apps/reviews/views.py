"""
Views and ViewSets for Vehicle Reviews and Customer Ratings.
"""
from django.db.models import Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from drf_spectacular.utils import extend_schema, extend_schema_view
from apps.accounts.permissions import IsAdminUserRole, IsOwnerOrAdmin
from apps.reviews.models import VehicleReview
from apps.reviews.filters import VehicleReviewFilter
from apps.reviews.serializers import (
    VehicleReviewSerializer,
    ReviewCreateSerializer,
    ReviewUpdateSerializer,
    ReviewModerationSerializer,
)
from apps.reviews.services import ReviewService


@extend_schema(tags=['Customer Reviews & Feedback'])
@extend_schema_view(
    list=extend_schema(summary="List Vehicle Reviews (Public sees approved; author sees own; admin sees all)"),
    retrieve=extend_schema(summary="Get Single Review Details"),
    create=extend_schema(summary="Submit Review for Vehicle Variant (Customer)"),
    update=extend_schema(summary="Update Own Review (Author)"),
    partial_update=extend_schema(summary="Partially Update Own Review (Author)"),
    destroy=extend_schema(summary="Delete Review (Author or Admin)"),
)
class VehicleReviewViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for vehicle reviews with moderation workflow and statistics.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VehicleReviewFilter
    search_fields = ['title', 'comment', 'variant__name', 'variant__model__name']
    ordering_fields = ['created_at', 'rating', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        base_qs = VehicleReview.objects.select_related(
            'customer',
            'variant',
            'variant__model',
            'variant__model__category'
        )

        # Admin users can view all reviews (PENDING, APPROVED, REJECTED)
        if user.is_authenticated and (user.role == 'ADMIN' or user.is_staff or user.is_superuser):
            return base_qs

        # Authenticated customers see all approved reviews + their own reviews
        if user.is_authenticated:
            return base_qs.filter(
                Q(moderation_status=VehicleReview.ModerationStatus.APPROVED) |
                Q(customer=user)
            )

        # Unauthenticated public visitors see only APPROVED reviews
        return base_qs.filter(moderation_status=VehicleReview.ModerationStatus.APPROVED)

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'stats']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'my_reviews']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
        elif self.action in ['moderate']:
            permission_classes = [IsAuthenticated, IsAdminUserRole]
        else:
            permission_classes = [IsAuthenticated]
        return [perm() for perm in permission_classes]

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ReviewUpdateSerializer
        elif self.action == 'moderate':
            return ReviewModerationSerializer
        return VehicleReviewSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        output_serializer = VehicleReviewSerializer(review, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated_review = serializer.save()
        output_serializer = VehicleReviewSerializer(updated_review, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='moderate')
    def moderate(self, request, pk=None):
        """
        Admin endpoint to approve, reject, or mark review as pending.
        """
        review = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')

        updated_review = ReviewService.moderate_review(
            review=review,
            moderator=request.user,
            new_status=new_status,
            notes=notes
        )
        return Response(
            VehicleReviewSerializer(updated_review, context={'request': request}).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='variant/(?P<variant_id>[^/.]+)/stats')
    def stats(self, request, variant_id=None):
        """
        Public endpoint returning aggregate rating metrics for a vehicle variant.
        """
        stats_data = ReviewService.get_variant_rating_stats(variant_id=int(variant_id))
        return Response(stats_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-reviews')
    def my_reviews(self, request):
        """
        Endpoint for authenticated customer to view all reviews authored by themselves.
        """
        qs = VehicleReview.objects.filter(customer=request.user).select_related(
            'customer',
            'variant',
            'variant__model',
            'variant__model__category'
        ).order_by('-created_at')

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = VehicleReviewSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = VehicleReviewSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

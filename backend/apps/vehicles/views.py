from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.accounts.permissions import IsAdminUserRole
from .models import VehicleCategory, VehicleModel, VehicleVariant
from .filters import VehicleVariantFilter
from .serializers import (
    VehicleCategorySerializer,
    VehicleModelSerializer,
    VehicleVariantListSerializer,
    VehicleVariantDetailSerializer,
    VehicleVariantCreateUpdateSerializer,
)

@extend_schema_view(
    list=extend_schema(summary="List Vehicle Categories (Public)"),
    retrieve=extend_schema(summary="Get Vehicle Category Details (Public)"),
    create=extend_schema(summary="Create Vehicle Category (Admin Only)"),
    update=extend_schema(summary="Update Vehicle Category (Admin Only)"),
    destroy=extend_schema(summary="Delete Vehicle Category (Admin Only)"),
)
class VehicleCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD API for EV Categories (e.g., Scooters, Cruiser Bikes, Commercial).
    """
    queryset = VehicleCategory.objects.all()
    serializer_class = VehicleCategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        if self.action in ['list', 'retrieve'] and not (
            self.request.user.is_authenticated and self.request.user.is_admin
        ):
            return self.queryset.filter(is_active=True)
        return self.queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Vehicle categories retrieved successfully.",
            "data": serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "Vehicle category retrieved successfully.",
            "data": serializer.data
        })


@extend_schema_view(
    list=extend_schema(summary="List Vehicle Models (Public)"),
    retrieve=extend_schema(summary="Get Vehicle Model Details (Public)"),
    create=extend_schema(summary="Create Vehicle Model (Admin Only)"),
    update=extend_schema(summary="Update Vehicle Model (Admin Only)"),
    destroy=extend_schema(summary="Delete Vehicle Model (Admin Only)"),
)
class VehicleModelViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Vehicle Models (e.g., 'X-One', 'SE', 'Ranger', 'MX16').
    """
    queryset = VehicleModel.objects.select_related('category').all()
    serializer_class = VehicleModelSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        if self.action in ['list', 'retrieve'] and not (
            self.request.user.is_authenticated and self.request.user.is_admin
        ):
            return self.queryset.filter(is_active=True)
        return self.queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Vehicle models retrieved successfully.",
            "data": serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "Vehicle model retrieved successfully.",
            "data": serializer.data
        })



@extend_schema_view(
    list=extend_schema(summary="Search, Filter, & Paginate Vehicle Catalogue (Public)"),
    retrieve=extend_schema(summary="Get Single Vehicle Details with Full Specs (Public)"),
    create=extend_schema(summary="Create Vehicle Variant with Specs (Admin Only)"),
    update=extend_schema(summary="Update Vehicle Variant with Specs (Admin Only)"),
    destroy=extend_schema(summary="Delete Vehicle Variant (Admin Only)"),
)
class VehicleVariantViewSet(viewsets.ModelViewSet):
    """
    Master Vehicle Variant ViewSet providing:
    - Public Search & Filtering (category, battery, range, price)
    - Sorting by price, range, and new arrivals
    - Pagination
    - Atomic Admin CRUD with specs
    """
    queryset = VehicleVariant.objects.select_related(
        'model',
        'model__category',
        'specification'
    ).prefetch_related('gallery_images').all()

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VehicleVariantFilter
    search_fields = [
        'name',
        'model__name',
        'model__category__name',
        'specification__battery_type',
        'sku',
    ]
    ordering_fields = [
        'base_price',
        'specification__driving_range_km',
        'specification__top_speed_kmh',
        'created_at',
    ]
    ordering = ['base_price']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'featured']:
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get_serializer_class(self):
        if self.action == 'list':
            return VehicleVariantListSerializer
        elif self.action == 'retrieve':
            return VehicleVariantDetailSerializer
        return VehicleVariantCreateUpdateSerializer

    def get_queryset(self):
        qs = self.queryset
        # Non-admins only see active vehicles
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            qs = qs.filter(is_active=True, model__is_active=True, model__category__is_active=True)
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "Vehicle details retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        read_serializer = VehicleVariantDetailSerializer(instance)
        return Response({
            "success": True,
            "message": "Vehicle variant created successfully.",
            "data": read_serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        read_serializer = VehicleVariantDetailSerializer(instance)
        return Response({
            "success": True,
            "message": "Vehicle variant updated successfully.",
            "data": read_serializer.data
        }, status=status.HTTP_200_OK)

    @extend_schema(summary="List Featured EV Models for Homepage Showcase")

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        featured_vehicles = self.get_queryset().filter(model__is_featured=True)[:6]
        serializer = VehicleVariantListSerializer(featured_vehicles, many=True)
        return Response({
            "success": True,
            "message": "Featured EV vehicles retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

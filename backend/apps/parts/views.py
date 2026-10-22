from django.db import transaction
from django.db.models import F
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from apps.accounts.permissions import IsAdminUserRole
from .models import PartCategory, SparePart
from .filters import SparePartFilter
from .serializers import (
    PartCategorySerializer,
    SparePartListSerializer,
    SparePartDetailSerializer,
    SparePartCreateUpdateSerializer,
    StockAdjustmentSerializer,
)

@extend_schema(tags=['Spare Parts & Inventory'])
@extend_schema_view(
    list=extend_schema(summary="List Spare Part Categories (Public)"),
    retrieve=extend_schema(summary="Get Part Category Details (Public)"),
    create=extend_schema(summary="Create Part Category (Admin Only)"),
    update=extend_schema(summary="Update Part Category (Admin Only)"),
    destroy=extend_schema(summary="Delete Part Category (Admin Only)"),
)
class PartCategoryViewSet(viewsets.ModelViewSet):
    queryset = PartCategory.objects.all()
    serializer_class = PartCategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUserRole()]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not (request.user.is_authenticated and request.user.is_admin):
            queryset = queryset.filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Part categories retrieved successfully.",
            "data": serializer.data
        })


@extend_schema(tags=['Spare Parts & Inventory'])
@extend_schema_view(
    list=extend_schema(summary="Search, Filter, & Paginate Spare Parts (Public)"),
    retrieve=extend_schema(summary="Get Single Spare Part Details (Public)"),
    create=extend_schema(summary="Create Spare Part (Admin Only)"),
    update=extend_schema(summary="Update Spare Part (Admin Only)"),
    destroy=extend_schema(summary="Delete Spare Part (Admin Only)"),
)
class SparePartViewSet(viewsets.ModelViewSet):
    """
    Spare parts inventory management ViewSet.
    Provides public catalogue browsing and protected inventory management.
    """
    queryset = SparePart.objects.select_related('category').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SparePartFilter
    search_fields = ['part_number', 'name', 'description', 'category__name']
    ordering_fields = ['price', 'stock_quantity', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get_serializer_class(self):
        if self.action == 'list':
            return SparePartListSerializer
        elif self.action == 'retrieve':
            return SparePartDetailSerializer
        elif self.action == 'adjust_stock':
            return StockAdjustmentSerializer
        return SparePartCreateUpdateSerializer

    def get_queryset(self):
        qs = self.queryset
        if not (self.request.user.is_authenticated and self.request.user.is_admin):
            qs = qs.filter(is_active=True, category__is_active=True)
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "Spare part details retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        read_serializer = SparePartDetailSerializer(instance)
        return Response({
            "success": True,
            "message": "Spare part created successfully.",
            "data": read_serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        read_serializer = SparePartDetailSerializer(instance)
        return Response({
            "success": True,
            "message": "Spare part updated successfully.",
            "data": read_serializer.data
        }, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Adjust Inventory Quantity (Admin Only)",
        description="Safely adjusts part stock quantity (ADD, DEDUCT, SET) inside a database transaction.",
        request=StockAdjustmentSerializer,
        responses={200: OpenApiResponse(description="Stock adjusted successfully")}
    )
    @action(detail=True, methods=['post'], url_path='adjust-stock', permission_classes=[IsAdminUserRole])
    @transaction.atomic
    def adjust_stock(self, request, pk=None):
        part = self.get_object()
        serializer = StockAdjustmentSerializer(data=request.data, context={'part': part})
        serializer.is_valid(raise_exception=True)

        action_type = serializer.validated_data['action']
        qty = serializer.validated_data['quantity']
        old_stock = part.stock_quantity

        if action_type == 'ADD':
            part.stock_quantity += qty
        elif action_type == 'DEDUCT':
            part.stock_quantity -= qty
        elif action_type == 'SET':
            part.stock_quantity = qty

        part.save()

        return Response({
            "success": True,
            "message": f"Stock for {part.part_number} updated from {old_stock} to {part.stock_quantity}.",
            "data": {
                "part_id": part.id,
                "part_number": part.part_number,
                "name": part.name,
                "previous_stock": old_stock,
                "current_stock": part.stock_quantity,
                "stock_status": part.stock_status,
                "is_in_stock": part.is_in_stock
            }
        }, status=status.HTTP_200_OK)

    @extend_schema(
        summary="List Low Stock Spare Parts (Admin Only)",
        description="Retrieves spare parts where inventory is at or below the alert threshold.",
        responses={200: OpenApiResponse(description="Low stock items retrieved")}
    )
    @action(detail=False, methods=['get'], url_path='low-stock', permission_classes=[IsAdminUserRole])
    def low_stock(self, request):
        low_stock_parts = self.get_queryset().filter(stock_quantity__lte=F('low_stock_threshold'))
        serializer = SparePartListSerializer(low_stock_parts, many=True)
        return Response({
            "success": True,
            "message": f"Retrieved {len(serializer.data)} items with low inventory alert.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

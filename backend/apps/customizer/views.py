from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from apps.accounts.permissions import IsAdminUserRole
from .models import Colour, ColourCombination, VehicleColourConfig
from .services import CustomizerService
from .serializers import (
    ColourSerializer,
    ColourCombinationSerializer,
    VehicleColourOptionSerializer,
    VehicleColourConfigAdminSerializer,
    PriceCalculationRequestSerializer,
)

@extend_schema(tags=['Customizer & Colours'])
@extend_schema_view(
    list=extend_schema(summary="List Vehicle Colours (Public)"),
    retrieve=extend_schema(summary="Get Colour Details (Public)"),
    create=extend_schema(summary="Create Colour (Admin Only)"),
    update=extend_schema(summary="Update Colour (Admin Only)"),
    destroy=extend_schema(summary="Delete Colour (Admin Only)"),
)
class ColourViewSet(viewsets.ModelViewSet):
    queryset = Colour.objects.all()
    serializer_class = ColourSerializer

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
            "message": "Colours retrieved successfully.",
            "data": serializer.data
        })


@extend_schema(tags=['Customizer & Colours'])
@extend_schema_view(
    list=extend_schema(summary="List Colour Combinations (Public)"),
    retrieve=extend_schema(summary="Get Colour Combination Details (Public)"),
    create=extend_schema(summary="Create Colour Combination (Admin Only)"),
    update=extend_schema(summary="Update Colour Combination (Admin Only)"),
    destroy=extend_schema(summary="Delete Colour Combination (Admin Only)"),
)
class ColourCombinationViewSet(viewsets.ModelViewSet):
    queryset = ColourCombination.objects.select_related(
        'primary_colour',
        'secondary_colour'
    ).all()
    serializer_class = ColourCombinationSerializer

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
            "message": "Colour combinations retrieved successfully.",
            "data": serializer.data
        })


@extend_schema(tags=['Customizer & Colours'])
class VehicleColourConfigViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for configuring vehicle colour options, images, and price adjustments.
    """
    queryset = VehicleColourConfig.objects.select_related(
        'variant',
        'combination',
        'combination__primary_colour',
        'combination__secondary_colour'
    ).all()
    serializer_class = VehicleColourConfigAdminSerializer
    permission_classes = [IsAdminUserRole]


class VariantCustomizationOptionsView(APIView):
    """
    Public endpoint providing all available colours and dual-tone finishes
    for a chosen vehicle variant to populate the React Customizer widget.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Get Vehicle Customizer Options",
        description="Returns available single-tone & dual-tone finishes with price adjustments and high-res images for a vehicle variant.",
        tags=['Customizer & Colours'],
        responses={200: OpenApiResponse(description="Customization options loaded")}
    )
    def get(self, request, variant_id):
        variant, configs = CustomizerService.get_available_options_for_variant(variant_id)
        serializer = VehicleColourOptionSerializer(configs, many=True)

        return Response({
            "success": True,
            "message": f"Customization options for {variant.model.name} {variant.name} loaded.",
            "data": {
                "variant_id": variant.id,
                "variant_name": variant.name,
                "model_name": variant.model.name,
                "base_price": str(variant.base_price),
                "options_count": len(configs),
                "options": serializer.data
            }
        }, status=status.HTTP_200_OK)


class CalculatePriceView(APIView):
    """
    Authoritative backend price calculation API.
    Computes final price = base_price + price_adjustment and validates configuration availability.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Calculate Dynamic Configuration Price",
        description="Validates variant and colour combination, calculates price adjustments, and returns authoritative total price and image.",
        tags=['Customizer & Colours'],
        request=PriceCalculationRequestSerializer,
        responses={
            200: OpenApiResponse(description="Price calculated successfully"),
            400: OpenApiResponse(description="Incompatible or unavailable combination")
        }
    )
    def post(self, request):
        req_serializer = PriceCalculationRequestSerializer(data=request.data)
        req_serializer.is_valid(raise_exception=True)

        variant_id = req_serializer.validated_data['variant_id']
        combination_id = req_serializer.validated_data['combination_id']

        result = CustomizerService.calculate_configuration_price(variant_id, combination_id)

        return Response({
            "success": True,
            "message": "Configuration price calculated successfully.",
            "data": result
        }, status=status.HTTP_200_OK)

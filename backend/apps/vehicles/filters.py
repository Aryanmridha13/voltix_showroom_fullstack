import django_filters
from .models import VehicleVariant

class VehicleVariantFilter(django_filters.FilterSet):
    """
    FilterSet for Vehicle Variants supporting query parameter filters:
    - category (slug or id)
    - model (slug or id)
    - battery_type (case-insensitive substring)
    - min_price, max_price (ex-showroom price bounds)
    - min_range, max_range (driving range km bounds)
    - min_speed (top speed km/h)
    - is_featured (boolean)
    """
    category = django_filters.CharFilter(
        field_name='model__category__slug',
        lookup_expr='iexact',
        label='Category Slug'
    )
    category_id = django_filters.NumberFilter(
        field_name='model__category__id',
        label='Category ID'
    )
    model = django_filters.CharFilter(
        field_name='model__slug',
        lookup_expr='iexact',
        label='Model Slug'
    )
    battery_type = django_filters.CharFilter(
        field_name='specification__battery_type',
        lookup_expr='icontains',
        label='Battery Type (e.g. Graphene, LiFePO4)'
    )
    min_price = django_filters.NumberFilter(
        field_name='base_price',
        lookup_expr='gte',
        label='Minimum Price'
    )
    max_price = django_filters.NumberFilter(
        field_name='base_price',
        lookup_expr='lte',
        label='Maximum Price'
    )
    min_range = django_filters.NumberFilter(
        field_name='specification__driving_range_km',
        lookup_expr='gte',
        label='Minimum Driving Range (KM)'
    )
    max_range = django_filters.NumberFilter(
        field_name='specification__driving_range_km',
        lookup_expr='lte',
        label='Maximum Driving Range (KM)'
    )
    min_speed = django_filters.NumberFilter(
        field_name='specification__top_speed_kmh',
        lookup_expr='gte',
        label='Minimum Top Speed (KM/H)'
    )
    is_featured = django_filters.BooleanFilter(
        field_name='model__is_featured',
        label='Featured Models Only'
    )

    class Meta:
        model = VehicleVariant
        fields = [
            'category',
            'category_id',
            'model',
            'battery_type',
            'min_price',
            'max_price',
            'min_range',
            'max_range',
            'min_speed',
            'is_featured',
        ]

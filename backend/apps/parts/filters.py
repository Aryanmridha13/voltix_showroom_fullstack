import django_filters
from django.db.models import F
from .models import SparePart

class SparePartFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(
        field_name='category__slug',
        lookup_expr='iexact',
        label='Category Slug'
    )
    category_id = django_filters.NumberFilter(
        field_name='category__id',
        label='Category ID'
    )
    min_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='gte',
        label='Minimum Price (₹)'
    )
    max_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='lte',
        label='Maximum Price (₹)'
    )
    stock_status = django_filters.ChoiceFilter(
        choices=SparePart.StockStatus.choices,
        method='filter_by_stock_status',
        label='Derived Stock Status'
    )

    class Meta:
        model = SparePart
        fields = [
            'category',
            'category_id',
            'min_price',
            'max_price',
            'stock_status',
        ]

    def filter_by_stock_status(self, queryset, name, value):
        if value == SparePart.StockStatus.OUT_OF_STOCK:
            return queryset.filter(stock_quantity=0)
        elif value == SparePart.StockStatus.LOW_STOCK:
            return queryset.filter(stock_quantity__gt=0, stock_quantity__lte=F('low_stock_threshold'))
        elif value == SparePart.StockStatus.IN_STOCK:
            return queryset.filter(stock_quantity__gt=F('low_stock_threshold'))
        return queryset

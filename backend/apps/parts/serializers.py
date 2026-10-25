from rest_framework import serializers
from .models import PartCategory, SparePart

class PartCategorySerializer(serializers.ModelSerializer):
    parts_count = serializers.IntegerField(source='parts.count', read_only=True)

    class Meta:
        model = PartCategory
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'is_active',
            'parts_count',
            'created_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at']


# ==============================================================================
# OLD CODE (SparePartListSerializer):
# ==============================================================================
# class SparePartListSerializer(serializers.ModelSerializer):
#     """
#     List representation exposing the dynamically computed stock_status
#     and stock availability badge without manual calculation.
#     """
#     category_name = serializers.CharField(source='category.name', read_only=True)
#     category_slug = serializers.CharField(source='category.slug', read_only=True)
#     stock_status = serializers.CharField(read_only=True)
#     is_in_stock = serializers.BooleanField(read_only=True)
# 
#     class Meta:
#         model = SparePart
#         fields = [
#             'id',
#             'category',
#             'category_name',
#             'category_slug',
#             'part_number',
#             'name',
#             'slug',
#             'price',
#             'image',
#             'stock_quantity',
#             'low_stock_threshold',
#             'stock_status',
#             'is_in_stock',
#             'is_active',
#             'created_at',
#         ]
#         read_only_fields = ['id', 'slug', 'stock_status', 'is_in_stock', 'created_at']

# ==============================================================================
# NEW CODE (SparePartListSerializer):
# ==============================================================================
class SparePartListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )
    category_slug = serializers.CharField(
        source='category.slug', read_only=True
    )
    stock_status = serializers.CharField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        if not obj.image:
            return None

        image_name = obj.image.name

        if image_name.startswith(('https://', 'http://')):
            return image_name

        return obj.image.url

    class Meta:
        model = SparePart
        fields = [
            'id', 'category', 'category_name', 'category_slug',
            'part_number', 'name', 'slug', 'price', 'image',
            'stock_quantity', 'low_stock_threshold',
            'stock_status', 'is_in_stock', 'is_active', 'created_at',
        ]
        read_only_fields = [
            'id', 'slug', 'stock_status', 'is_in_stock', 'created_at'
        ]


# ==============================================================================
# OLD CODE (SparePartDetailSerializer):
# ==============================================================================
# class SparePartDetailSerializer(serializers.ModelSerializer):
#     """
#     Full detail representation for single spare part view.
#     """
#     category_details = PartCategorySerializer(source='category', read_only=True)
#     stock_status = serializers.CharField(read_only=True)
#     is_in_stock = serializers.BooleanField(read_only=True)
# 
#     class Meta:
#         model = SparePart
#         fields = [
#             'id',
#             'category',
#             'category_details',
#             'part_number',
#             'name',
#             'slug',
#             'description',
#             'price',
#             'image',
#             'stock_quantity',
#             'low_stock_threshold',
#             'stock_status',
#             'is_in_stock',
#             'is_active',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = ['id', 'slug', 'stock_status', 'is_in_stock', 'created_at', 'updated_at']

# ==============================================================================
# NEW CODE (SparePartDetailSerializer):
# ==============================================================================
class SparePartDetailSerializer(serializers.ModelSerializer):
    """
    Full detail representation for single spare part view.
    """
    category_details = PartCategorySerializer(source='category', read_only=True)
    stock_status = serializers.CharField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        if not obj.image:
            return None

        image_name = obj.image.name

        if image_name.startswith(('https://', 'http://')):
            return image_name

        return obj.image.url

    class Meta:
        model = SparePart
        fields = [
            'id',
            'category',
            'category_details',
            'part_number',
            'name',
            'slug',
            'description',
            'price',
            'image',
            'stock_quantity',
            'low_stock_threshold',
            'stock_status',
            'is_in_stock',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'stock_status', 'is_in_stock', 'created_at', 'updated_at']


class SparePartCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Admin serializer for creating and editing spare part details.
    """
    stock_status = serializers.CharField(read_only=True)

    class Meta:
        model = SparePart
        fields = [
            'id',
            'category',
            'part_number',
            'name',
            'description',
            'price',
            'image',
            'stock_quantity',
            'low_stock_threshold',
            'stock_status',
            'is_active',
        ]
        read_only_fields = ['id', 'stock_status']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value


class StockAdjustmentSerializer(serializers.Serializer):
    """
    Serializes admin stock adjustment actions (ADD, DEDUCT, SET).
    """
    ACTION_CHOICES = (
        ('ADD', 'Add to current stock'),
        ('DEDUCT', 'Deduct from current stock'),
        ('SET', 'Set exact stock quantity'),
    )

    action = serializers.ChoiceField(choices=ACTION_CHOICES, required=True)
    quantity = serializers.IntegerField(min_value=0, required=True)
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')

    def validate(self, attrs):
        action = attrs['action']
        qty = attrs['quantity']
        part = self.context.get('part')

        if action == 'DEDUCT' and part:
            if part.stock_quantity < qty:
                raise serializers.ValidationError({
                    "quantity": (
                        f"Cannot deduct {qty} units. Current stock is only {part.stock_quantity} units."
                    )
                })
        return attrs

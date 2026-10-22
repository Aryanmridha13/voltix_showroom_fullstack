from decimal import Decimal
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimestampedModel

class PartCategory(TimestampedModel):
    """
    Classification for spare parts (e.g., Batteries & Chargers, Braking Systems, Motors, Tyres).
    """
    name = models.CharField(_('category name'), max_length=100, unique=True)
    slug = models.SlugField(_('slug'), max_length=120, unique=True, blank=True)
    description = models.TextField(_('description'), blank=True, default='')
    is_active = models.BooleanField(_('is active'), default=True, db_index=True)

    class Meta:
        verbose_name = _('Spare Part Category')
        verbose_name_plural = _('Spare Part Categories')
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SparePart(TimestampedModel):
    """
    Spare part item record with pricing, inventory quantity, and low-stock threshold.
    Stock status is dynamically derived from quantity and threshold.
    """
    class StockStatus(models.TextChoices):
        IN_STOCK = 'IN_STOCK', _('In Stock')
        LOW_STOCK = 'LOW_STOCK', _('Low Stock')
        OUT_OF_STOCK = 'OUT_OF_STOCK', _('Out of Stock')

    category = models.ForeignKey(
        PartCategory,
        on_delete=models.RESTRICT,
        related_name='parts',
        verbose_name=_('category')
    )
    part_number = models.CharField(
        _('part number / SKU'),
        max_length=60,
        unique=True,
        db_index=True,
        help_text=_('Unique SKU (e.g. VOLT-BAT-LIPO4-72V)')
    )
    name = models.CharField(_('part name'), max_length=150)
    slug = models.SlugField(_('slug'), max_length=180, unique=True, blank=True)
    description = models.TextField(_('description'))
    price = models.DecimalField(
        _('price (₹)'),
        max_digits=10,
        decimal_places=2,
        db_index=True
    )
    image = models.ImageField(
        _('part photo'),
        upload_to='parts/',
        blank=True,
        null=True
    )
    stock_quantity = models.PositiveIntegerField(
        _('stock quantity'),
        default=0,
        db_index=True
    )
    low_stock_threshold = models.PositiveIntegerField(
        _('low stock alert threshold'),
        default=5
    )
    is_active = models.BooleanField(_('is active'), default=True, db_index=True)

    class Meta:
        verbose_name = _('Spare Part')
        verbose_name_plural = _('Spare Parts')
        ordering = ['name']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(price__gte=0),
                name='sparepart_price_non_negative'
            )
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.part_number}-{self.name}")
        super().save(*args, **kwargs)

    @property
    def stock_status(self) -> str:
        """
        Dynamically derives stock availability.
        Never hardcoded in the database or frontend.
        """
        if self.stock_quantity == 0:
            return self.StockStatus.OUT_OF_STOCK
        elif self.stock_quantity <= self.low_stock_threshold:
            return self.StockStatus.LOW_STOCK
        return self.StockStatus.IN_STOCK

    @property
    def is_in_stock(self) -> bool:
        return self.stock_quantity > 0

    def __str__(self):
        return f"{self.part_number} - {self.name} (Qty: {self.stock_quantity})"

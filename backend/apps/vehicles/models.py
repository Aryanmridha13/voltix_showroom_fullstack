from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimestampedModel

class VehicleCategory(TimestampedModel):
    """
    EV Category (e.g., Low Speed Scooter, High Speed Scooter, Cruiser Bike, Commercial).
    """
    name = models.CharField(_('category name'), max_length=100, unique=True)
    slug = models.SlugField(_('slug'), max_length=120, unique=True, blank=True)
    description = models.TextField(_('description'), blank=True, default='')
    icon = models.ImageField(_('icon/banner'), upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(_('is active'), default=True, db_index=True)

    class Meta:
        verbose_name = _('Vehicle Category')
        verbose_name_plural = _('Vehicle Categories')
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class VehicleModel(TimestampedModel):
    """
    EV Model Series (e.g., 'X-One', 'SE', 'Ranger', 'MX16', 'XR7').
    A model belongs to a category and contains multiple variants with different specs/prices.
    """
    category = models.ForeignKey(
        VehicleCategory,
        on_delete=models.PROTECT,
        related_name='models',
        verbose_name=_('category')
    )
    name = models.CharField(_('model name'), max_length=120)
    slug = models.SlugField(_('slug'), max_length=150, unique=True, blank=True)
    tagline = models.CharField(_('tagline'), max_length=255, blank=True, default='')
    description = models.TextField(_('description'), blank=True, default='')
    is_featured = models.BooleanField(_('featured model'), default=False, db_index=True)
    is_active = models.BooleanField(_('is active'), default=True, db_index=True)

    class Meta:
        verbose_name = _('Vehicle Model')
        verbose_name_plural = _('Vehicle Models')
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.category.name}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class VehicleVariant(TimestampedModel):
    """
    Specific Variant of a Model (e.g., 'SE Pro', 'SE Ultra', 'X-One Graphene').
    Defines the baseline pricing and default catalogue image.
    """
    model = models.ForeignKey(
        VehicleModel,
        on_delete=models.CASCADE,
        related_name='variants',
        verbose_name=_('vehicle model')
    )
    name = models.CharField(_('variant name'), max_length=120)
    slug = models.SlugField(_('slug'), max_length=160, unique=True, blank=True)
    sku = models.CharField(_('SKU / Code'), max_length=60, unique=True)
    base_price = models.DecimalField(
        _('ex-showroom price (₹)'),
        max_digits=12,
        decimal_places=2,
        db_index=True
    )
    original_price = models.DecimalField(
        _('strikethrough original price (₹)'),
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        help_text=_('For promotional strikethrough display (e.g., ₹104,999/-*)')
    )
    default_image = models.ImageField(
        _('catalogue display image'),
        upload_to='vehicles/variants/',
        blank=True,
        null=True
    )
    is_active = models.BooleanField(_('is active'), default=True, db_index=True)

    class Meta:
        verbose_name = _('Vehicle Variant')
        verbose_name_plural = _('Vehicle Variants')
        ordering = ['base_price']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(base_price__gte=0),
                name='vehicle_base_price_non_negative'
            )
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.model.name}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.model.name} {self.name} - ₹{self.base_price}"


class VehicleSpecification(TimestampedModel):
    """
    Technical and Performance Specifications for a Vehicle Variant.
    One-to-One relationship with VehicleVariant.
    """
    variant = models.OneToOneField(
        VehicleVariant,
        on_delete=models.CASCADE,
        related_name='specification',
        verbose_name=_('vehicle variant')
    )
    battery_type = models.CharField(
        _('battery type'),
        max_length=100,
        help_text=_('e.g., Graphene, LiFePO4, Advance Lithium')
    )
    battery_capacity = models.CharField(
        _('battery capacity'),
        max_length=60,
        help_text=_('e.g., 72V 32Ah, 3.2 kWh')
    )
    driving_range_km = models.PositiveIntegerField(
        _('driving range (km)'),
        help_text=_('Full charge estimated range (e.g., 60, 100, 322)')
    )
    top_speed_kmh = models.PositiveIntegerField(
        _('top speed (km/h)'),
        help_text=_('e.g., 25, 65, 80')
    )
    charging_time_hours = models.DecimalField(
        _('charging time (hours)'),
        max_digits=4,
        decimal_places=1,
        help_text=_('e.g., 4.5')
    )
    motor_power_watt = models.PositiveIntegerField(
        _('motor power (Watts)'),
        help_text=_('e.g., 1200, 2500, 4000')
    )
    warranty_years = models.PositiveIntegerField(
        _('warranty period (years)'),
        default=3
    )
    brakes_type = models.CharField(
        _('brakes type'),
        max_length=100,
        default='Front Disc, Rear Drum'
    )
    tyres_type = models.CharField(
        _('tyres type'),
        max_length=100,
        default='Tubeless 90/90-12'
    )
    carrying_capacity_kg = models.PositiveIntegerField(
        _('carrying capacity (kg)'),
        default=150
    )

    class Meta:
        verbose_name = _('Vehicle Specification')
        verbose_name_plural = _('Vehicle Specifications')

    def __str__(self):
        return f"Specs for {self.variant.model.name} {self.variant.name}"


class VehicleImage(TimestampedModel):
    """
    Secondary gallery images for rich vehicle showcase pages.
    """
    variant = models.ForeignKey(
        VehicleVariant,
        on_delete=models.CASCADE,
        related_name='gallery_images',
        verbose_name=_('vehicle variant')
    )
    image = models.ImageField(_('gallery image'), upload_to='vehicles/gallery/')
    caption = models.CharField(_('caption / view angle'), max_length=150, blank=True, default='')
    display_order = models.PositiveIntegerField(_('display order'), default=0)

    class Meta:
        verbose_name = _('Vehicle Gallery Image')
        verbose_name_plural = _('Vehicle Gallery Images')
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"Image for {self.variant.name} ({self.caption or 'Gallery'})"

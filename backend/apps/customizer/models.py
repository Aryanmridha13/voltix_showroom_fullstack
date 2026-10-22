from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimestampedModel
from apps.vehicles.models import VehicleVariant

class Colour(TimestampedModel):
    """
    Standard paint color with display name and HEX color code.
    """
    name = models.CharField(_('colour name'), max_length=60, unique=True)
    hex_code = models.CharField(
        _('HEX color code'),
        max_length=7,
        help_text=_('e.g., #E62E2D or #1E88E5')
    )
    is_active = models.BooleanField(_('is active'), default=True, db_index=True)

    class Meta:
        verbose_name = _('Colour')
        verbose_name_plural = _('Colours')
        ordering = ['name']

    def clean(self):
        super().clean()
        if not self.hex_code.startswith('#') or len(self.hex_code) != 7:
            raise ValidationError({'hex_code': _("HEX code must be in the format '#RRGGBB' (e.g. #E62E2D).")})

    def __str__(self):
        return f"{self.name} ({self.hex_code})"


class ColourCombination(TimestampedModel):
    """
    Colour combinations supporting both Single-Tone (monotone)
    and Dual-Tone exterior finishes.
    """
    name = models.CharField(_('combination name'), max_length=120)
    is_dual_tone = models.BooleanField(_('is dual-tone finish'), default=False, db_index=True)
    primary_colour = models.ForeignKey(
        Colour,
        on_delete=models.RESTRICT,
        related_name='primary_combinations',
        verbose_name=_('primary colour')
    )
    secondary_colour = models.ForeignKey(
        Colour,
        on_delete=models.RESTRICT,
        related_name='secondary_combinations',
        verbose_name=_('secondary colour (for dual-tone)'),
        null=True,
        blank=True
    )
    is_active = models.BooleanField(_('is active'), default=True, db_index=True)

    class Meta:
        verbose_name = _('Colour Combination')
        verbose_name_plural = _('Colour Combinations')
        ordering = ['is_dual_tone', 'name']
        constraints = [
            models.UniqueConstraint(
                fields=['primary_colour', 'secondary_colour'],
                name='unique_colour_combination'
            )
        ]

    def clean(self):
        super().clean()
        if self.is_dual_tone:
            if not self.secondary_colour:
                raise ValidationError({
                    'secondary_colour': _("Dual-tone combinations require a secondary colour.")
                })
            if self.primary_colour_id == self.secondary_colour_id:
                raise ValidationError({
                    'secondary_colour': _("Primary and secondary colours cannot be the same in a dual-tone combination.")
                })
        else:
            if self.secondary_colour:
                raise ValidationError({
                    'secondary_colour': _("Single-tone finishes cannot have a secondary colour.")
                })

    def save(self, *args, **kwargs):
        self.clean()
        if not self.name:
            if self.is_dual_tone and self.secondary_colour:
                self.name = f"{self.primary_colour.name} & {self.secondary_colour.name} Dual-Tone"
            else:
                self.name = f"{self.primary_colour.name} Monotone"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class VehicleColourConfig(TimestampedModel):
    """
    Vehicle Variant to Colour Combination mapping.
    Stores the specific rendered image for that color and any additive price adjustment.
    """
    variant = models.ForeignKey(
        VehicleVariant,
        on_delete=models.CASCADE,
        related_name='colour_configs',
        verbose_name=_('vehicle variant')
    )
    combination = models.ForeignKey(
        ColourCombination,
        on_delete=models.RESTRICT,
        related_name='vehicle_configs',
        verbose_name=_('colour combination')
    )
    image = models.ImageField(
        _('customized vehicle image'),
        upload_to='vehicles/customizer/',
        blank=True,
        null=True,
        help_text=_('High-resolution render of the vehicle in this exact color finish')
    )
    price_adjustment = models.DecimalField(
        _('price adjustment (₹)'),
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_('Additive amount (e.g., ₹1500 for dual-tone premium finish, 0 for standard)')
    )
    is_available = models.BooleanField(_('currently available'), default=True, db_index=True)

    class Meta:
        verbose_name = _('Vehicle Colour Configuration')
        verbose_name_plural = _('Vehicle Colour Configurations')
        ordering = ['price_adjustment', 'combination__name']
        constraints = [
            models.UniqueConstraint(
                fields=['variant', 'combination'],
                name='unique_variant_colour_config'
            )
        ]

    @property
    def total_price(self):
        return self.variant.base_price + self.price_adjustment

    def __str__(self):
        return f"{self.variant.name} in {self.combination.name} (+₹{self.price_adjustment})"

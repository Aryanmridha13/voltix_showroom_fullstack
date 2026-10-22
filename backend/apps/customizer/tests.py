from decimal import Decimal
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.vehicles.models import VehicleCategory, VehicleModel, VehicleVariant, VehicleSpecification
from apps.customizer.models import Colour, ColourCombination, VehicleColourConfig

User = get_user_model()

class VehicleCustomizerAPITests(APITestCase):
    def setUp(self):
        # 1. Users
        self.admin_user = User.objects.create_superuser(
            email='admin@voltixev.com',
            username='admin_customizer',
            password='AdminPassword123!',
            role=User.Role.ADMIN
        )
        self.customer_user = User.objects.create_user(
            email='customer@example.com',
            username='customer_customizer',
            password='CustomerPassword123!',
            role=User.Role.CUSTOMER
        )

        # 2. Vehicle
        self.category = VehicleCategory.objects.create(name='High Speed Scooter', slug='high-speed')
        self.model = VehicleModel.objects.create(category=self.category, name='SE', slug='se-model')
        self.variant = VehicleVariant.objects.create(
            model=self.model,
            name='SE Pro',
            sku='TEST-SE-PRO-CUST',
            base_price=Decimal('97999.00'),
            is_active=True
        )

        # 3. Colours
        self.red = Colour.objects.create(name='Crimson Red', hex_code='#E62E2D')
        self.white = Colour.objects.create(name='Pearl White', hex_code='#F8F9FA')
        self.blue = Colour.objects.create(name='Electric Blue', hex_code='#1E88E5')

        # 4. Combinations
        self.monotone_red = ColourCombination.objects.create(
            name='Crimson Red Monotone',
            is_dual_tone=False,
            primary_colour=self.red
        )
        self.dualtone_white_blue = ColourCombination.objects.create(
            name='White & Blue Dual-Tone',
            is_dual_tone=True,
            primary_colour=self.white,
            secondary_colour=self.blue
        )

        # 5. Configurations
        self.config_monotone = VehicleColourConfig.objects.create(
            variant=self.variant,
            combination=self.monotone_red,
            price_adjustment=Decimal('0.00'),
            is_available=True
        )
        self.config_dualtone = VehicleColourConfig.objects.create(
            variant=self.variant,
            combination=self.dualtone_white_blue,
            price_adjustment=Decimal('1500.00'),
            is_available=True
        )

        self.options_url = reverse('customizer:variant-options', kwargs={'variant_id': self.variant.id})
        self.calc_price_url = reverse('customizer:calculate-price')

    def test_colour_hex_validation(self):
        invalid_colour = Colour(name='Bad Color', hex_code='ZZZZZZ')
        with self.assertRaises(ValidationError):
            invalid_colour.clean()

    def test_dual_tone_requires_secondary_colour(self):
        comb = ColourCombination(
            name='Invalid Dual',
            is_dual_tone=True,
            primary_colour=self.red,
            secondary_colour=None
        )
        with self.assertRaises(ValidationError):
            comb.clean()

    def test_dual_tone_same_colours_fails(self):
        comb = ColourCombination(
            name='Same Color Dual',
            is_dual_tone=True,
            primary_colour=self.red,
            secondary_colour=self.red
        )
        with self.assertRaises(ValidationError):
            comb.clean()

    def test_single_tone_cannot_have_secondary_colour(self):
        comb = ColourCombination(
            name='Invalid Monotone',
            is_dual_tone=False,
            primary_colour=self.red,
            secondary_colour=self.white
        )
        with self.assertRaises(ValidationError):
            comb.clean()

    def test_get_variant_customizer_options_public(self):
        response = self.client.get(self.options_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['variant_id'], self.variant.id)
        self.assertEqual(response.data['data']['options_count'], 2)
        self.assertEqual(len(response.data['data']['options']), 2)

    def test_calculate_price_standard_monotone(self):
        payload = {
            "variant_id": self.variant.id,
            "combination_id": self.monotone_red.id
        }
        response = self.client.post(self.calc_price_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['base_price'], '97999.00')
        self.assertEqual(response.data['data']['price_adjustment'], '0.00')
        self.assertEqual(response.data['data']['total_price'], '97999.00')

    def test_calculate_price_dual_tone_premium(self):
        payload = {
            "variant_id": self.variant.id,
            "combination_id": self.dualtone_white_blue.id
        }
        response = self.client.post(self.calc_price_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['base_price'], '97999.00')
        self.assertEqual(response.data['data']['price_adjustment'], '1500.00')
        self.assertEqual(response.data['data']['total_price'], '99499.00')
        self.assertTrue(response.data['data']['is_dual_tone'])

    def test_calculate_price_incompatible_combination_fails(self):
        # Create unmapped combination
        other_comb = ColourCombination.objects.create(
            name='Unmapped',
            is_dual_tone=False,
            primary_colour=self.blue
        )
        payload = {
            "variant_id": self.variant.id,
            "combination_id": other_comb.id
        }
        response = self.client.post(self.calc_price_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_calculate_price_unavailable_combination_fails(self):
        self.config_dualtone.is_available = False
        self.config_dualtone.save()

        payload = {
            "variant_id": self.variant.id,
            "combination_id": self.dualtone_white_blue.id
        }
        response = self.client.post(self.calc_price_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_admin_can_update_price_adjustment(self):
        self.client.force_authenticate(user=self.admin_user)
        config_url = reverse('customizer:config-detail', kwargs={'pk': self.config_dualtone.id})
        patch_payload = {
            "price_adjustment": "2500.00"
        }
        response = self.client.patch(config_url, patch_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.config_dualtone.refresh_from_db()
        self.assertEqual(self.config_dualtone.price_adjustment, Decimal('2500.00'))

    def test_customer_forbidden_from_updating_config(self):
        self.client.force_authenticate(user=self.customer_user)
        config_url = reverse('customizer:config-detail', kwargs={'pk': self.config_dualtone.id})
        response = self.client.patch(config_url, {"price_adjustment": "0.00"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

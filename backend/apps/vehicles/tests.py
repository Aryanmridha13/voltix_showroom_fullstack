from decimal import Decimal
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.vehicles.models import (
    VehicleCategory,
    VehicleModel,
    VehicleVariant,
    VehicleSpecification,
)

User = get_user_model()

class VehicleCatalogueAPITests(APITestCase):
    def setUp(self):
        # 1. Users
        self.admin_user = User.objects.create_superuser(
            email='admin@voltixev.com',
            username='admin_test',
            password='AdminPassword123!',
            role=User.Role.ADMIN
        )
        self.customer_user = User.objects.create_user(
            email='customer@example.com',
            username='customer_test',
            password='CustomerPassword123!',
            role=User.Role.CUSTOMER
        )

        # 2. Category & Model
        self.category = VehicleCategory.objects.create(
            name='High Speed Scooter',
            slug='high-speed-scooter'
        )
        self.category_cruiser = VehicleCategory.objects.create(
            name='Cruiser Bikes',
            slug='cruiser-bikes'
        )

        self.model_se = VehicleModel.objects.create(
            category=self.category,
            name='SE',
            slug='high-speed-scooter-se',
            is_featured=True
        )

        # 3. Variants & Specs
        self.variant_se_pro = VehicleVariant.objects.create(
            model=self.model_se,
            name='SE Pro',
            sku='TEST-SE-PRO',
            base_price=Decimal('97999.00'),
            is_active=True
        )
        VehicleSpecification.objects.create(
            variant=self.variant_se_pro,
            battery_type='LiFePO4',
            battery_capacity='72V 60Ah',
            driving_range_km=322,
            top_speed_kmh=65,
            charging_time_hours=Decimal('5.0'),
            motor_power_watt=2500
        )

        self.variant_se_ultra = VehicleVariant.objects.create(
            model=self.model_se,
            name='SE Ultra',
            sku='TEST-SE-ULTRA',
            base_price=Decimal('121999.00'),
            is_active=True
        )
        VehicleSpecification.objects.create(
            variant=self.variant_se_ultra,
            battery_type='LiFePO4',
            battery_capacity='72V 80Ah',
            driving_range_km=418,
            top_speed_kmh=70,
            charging_time_hours=Decimal('5.5'),
            motor_power_watt=3000
        )

        self.list_url = reverse('vehicles:variant-list')
        self.featured_url = reverse('vehicles:variant-featured')
        self.detail_url = reverse('vehicles:variant-detail', kwargs={'pk': self.variant_se_pro.pk})

    def test_list_categories_public(self):
        url = reverse('vehicles:category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(len(response.data['data']), 2)

    def test_list_vehicles_public_and_paginated(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('data', response.data)
        self.assertIn('meta', response.data)
        self.assertEqual(response.data['meta']['page'], 1)
        self.assertGreaterEqual(response.data['meta']['total_records'], 2)

    def test_filter_vehicles_by_category(self):
        response = self.client.get(f"{self.list_url}?category=high-speed-scooter")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for v in response.data['data']:
            self.assertEqual(v['category_slug'], 'high-speed-scooter')

    def test_filter_vehicles_by_price_and_range(self):
        # Filter range >= 400 km
        response = self.client.get(f"{self.list_url}?min_range=400")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['name'], 'SE Ultra')

    def test_search_vehicles(self):
        response = self.client.get(f"{self.list_url}?search=Ultra")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['name'], 'SE Ultra')

    def test_ordering_vehicles_by_price_descending(self):
        response = self.client.get(f"{self.list_url}?ordering=-base_price")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [Decimal(v['base_price']) for v in response.data['data']]
        self.assertEqual(prices, sorted(prices, reverse=True))

    def test_get_vehicle_detail_with_specifications(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['name'], 'SE Pro')
        self.assertIn('specification', response.data['data'])
        self.assertEqual(response.data['data']['specification']['driving_range_km'], 322)
        self.assertEqual(response.data['data']['specification']['top_speed_kmh'], 65)

    def test_featured_action(self):
        response = self.client.get(self.featured_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(len(response.data['data']), 1)

    def test_admin_can_create_vehicle_with_specs(self):
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            "model": self.model_se.id,
            "name": "SE Eco Special",
            "sku": "TEST-SE-ECO-01",
            "base_price": "69999.00",
            "original_price": "74999.00",
            "is_active": True,
            "specification": {
                "battery_type": "Graphene Core",
                "battery_capacity": "60V 30Ah",
                "driving_range_km": 85,
                "top_speed_kmh": 40,
                "charging_time_hours": "3.5",
                "motor_power_watt": 1500,
                "warranty_years": 3,
                "brakes_type": "Front Disc, Rear Drum",
                "tyres_type": "Tubeless 90/90-12",
                "carrying_capacity_kg": 150
            }
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify DB
        created_variant = VehicleVariant.objects.get(sku="TEST-SE-ECO-01")
        self.assertEqual(created_variant.specification.driving_range_km, 85)
        self.assertEqual(created_variant.base_price, Decimal('69999.00'))

    def test_customer_forbidden_from_creating_vehicle(self):
        self.client.force_authenticate(user=self.customer_user)
        payload = {
            "model": self.model_se.id,
            "name": "Hacked Vehicle",
            "sku": "HACK-01",
            "base_price": "1000.00",
            "specification": {
                "battery_type": "Lead",
                "battery_capacity": "12V",
                "driving_range_km": 10,
                "top_speed_kmh": 10,
                "charging_time_hours": "10",
                "motor_power_watt": 100
            }
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_admin_can_update_vehicle_and_specs(self):
        self.client.force_authenticate(user=self.admin_user)
        patch_payload = {
            "base_price": "99999.00",
            "specification": {
                "driving_range_km": 350
            }
        }
        response = self.client.patch(self.detail_url, patch_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.variant_se_pro.refresh_from_db()
        self.assertEqual(self.variant_se_pro.base_price, Decimal('99999.00'))
        self.assertEqual(self.variant_se_pro.specification.driving_range_km, 350)

    def test_admin_can_delete_vehicle(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(VehicleVariant.objects.filter(pk=self.variant_se_pro.pk).exists())

    def test_filter_variants_by_fuel_type(self):
        # Create a petrol model and variant
        petrol_model = VehicleModel.objects.create(
            category=self.category_cruiser,
            name='Continental GT 650',
            slug='cruiser-continental-gt-650',
            fuel_type='petrol',
            is_active=True
        )
        petrol_variant = VehicleVariant.objects.create(
            model=petrol_model,
            name='Mr Clean',
            sku='TEST-GT650-CLEAN',
            base_price=Decimal('345000.00'),
            is_active=True
        )
        VehicleSpecification.objects.create(
            variant=petrol_variant,
            engine_displacement_cc=648,
            max_power_bhp='47 bhp',
            driving_range_km=310,
            top_speed_kmh=169
        )

        # Test filtering for petrol
        response_petrol = self.client.get(f"{self.list_url}?fuel_type=petrol")
        self.assertEqual(response_petrol.status_code, status.HTTP_200_OK)
        items = response_petrol.data['data']
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['sku'], 'TEST-GT650-CLEAN')
        self.assertEqual(items[0]['fuel_type'], 'petrol')

        # Test filtering for electric
        response_electric = self.client.get(f"{self.list_url}?fuel_type=electric")
        self.assertEqual(response_electric.status_code, status.HTTP_200_OK)
        electric_items = response_electric.data['data']
        self.assertTrue(all(item['fuel_type'] == 'electric' for item in electric_items))

from decimal import Decimal
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.parts.models import PartCategory, SparePart

User = get_user_model()

class SparePartsAPITests(APITestCase):
    def setUp(self):
        # 1. Users
        self.admin_user = User.objects.create_superuser(
            email='admin@voltixev.com',
            username='admin_parts',
            password='AdminPassword123!',
            role=User.Role.ADMIN
        )
        self.customer_user = User.objects.create_user(
            email='customer@example.com',
            username='customer_parts',
            password='CustomerPassword123!',
            role=User.Role.CUSTOMER
        )

        # 2. Category
        self.category_battery = PartCategory.objects.create(
            name='Batteries & Chargers',
            slug='batteries-chargers'
        )
        self.category_brakes = PartCategory.objects.create(
            name='Braking Systems',
            slug='braking-systems'
        )

        # 3. Spare Parts in different stock states
        # In Stock: Qty 15, Threshold 5 -> IN_STOCK
        self.part_in_stock = SparePart.objects.create(
            category=self.category_battery,
            part_number='TEST-BAT-72V',
            name='72V Lithium Pack',
            description='Test battery description',
            price=Decimal('30000.00'),
            stock_quantity=15,
            low_stock_threshold=5,
            is_active=True
        )

        # Low Stock: Qty 3, Threshold 5 -> LOW_STOCK
        self.part_low_stock = SparePart.objects.create(
            category=self.category_brakes,
            part_number='TEST-BRK-CALIPER',
            name='Front Disc Caliper',
            description='Test brake caliper',
            price=Decimal('2000.00'),
            stock_quantity=3,
            low_stock_threshold=5,
            is_active=True
        )

        # Out of Stock: Qty 0, Threshold 5 -> OUT_OF_STOCK
        self.part_out_of_stock = SparePart.objects.create(
            category=self.category_brakes,
            part_number='TEST-BRK-PAD',
            name='Ceramic Brake Pads',
            description='Test brake pads',
            price=Decimal('500.00'),
            stock_quantity=0,
            low_stock_threshold=5,
            is_active=True
        )

        self.list_url = reverse('parts:item-list')
        self.low_stock_url = reverse('parts:item-low-stock')
        self.detail_url = reverse('parts:item-detail', kwargs={'pk': self.part_in_stock.pk})
        self.adjust_url = reverse('parts:item-adjust-stock', kwargs={'pk': self.part_in_stock.pk})

    def test_stock_status_dynamic_derivation(self):
        self.assertEqual(self.part_in_stock.stock_status, SparePart.StockStatus.IN_STOCK)
        self.assertTrue(self.part_in_stock.is_in_stock)

        self.assertEqual(self.part_low_stock.stock_status, SparePart.StockStatus.LOW_STOCK)
        self.assertTrue(self.part_low_stock.is_in_stock)

        self.assertEqual(self.part_out_of_stock.stock_status, SparePart.StockStatus.OUT_OF_STOCK)
        self.assertFalse(self.part_out_of_stock.is_in_stock)

    def test_list_spare_parts_public_and_pagination(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('data', response.data)
        self.assertIn('meta', response.data)
        self.assertEqual(response.data['meta']['page'], 1)
        self.assertGreaterEqual(response.data['meta']['total_records'], 3)

    def test_filter_by_stock_status_in_stock(self):
        response = self.client.get(f"{self.list_url}?stock_status=IN_STOCK")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for part in response.data['data']:
            self.assertEqual(part['stock_status'], 'IN_STOCK')

    def test_filter_by_stock_status_low_stock(self):
        response = self.client.get(f"{self.list_url}?stock_status=LOW_STOCK")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for part in response.data['data']:
            self.assertEqual(part['stock_status'], 'LOW_STOCK')

    def test_filter_by_stock_status_out_of_stock(self):
        response = self.client.get(f"{self.list_url}?stock_status=OUT_OF_STOCK")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for part in response.data['data']:
            self.assertEqual(part['stock_status'], 'OUT_OF_STOCK')

    def test_filter_by_category_and_price(self):
        response = self.client.get(f"{self.list_url}?category=braking-systems&max_price=1000")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['part_number'], 'TEST-BRK-PAD')

    def test_search_spare_parts(self):
        response = self.client.get(f"{self.list_url}?search=Caliper")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['part_number'], 'TEST-BRK-CALIPER')

    def test_admin_can_adjust_stock_add(self):
        self.client.force_authenticate(user=self.admin_user)
        payload = {"action": "ADD", "quantity": 10}
        response = self.client.post(self.adjust_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['current_stock'], 25)

        self.part_in_stock.refresh_from_db()
        self.assertEqual(self.part_in_stock.stock_quantity, 25)

    def test_admin_can_adjust_stock_deduct(self):
        self.client.force_authenticate(user=self.admin_user)
        payload = {"action": "DEDUCT", "quantity": 5}
        response = self.client.post(self.adjust_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['current_stock'], 10)

        self.part_in_stock.refresh_from_db()
        self.assertEqual(self.part_in_stock.stock_quantity, 10)

    def test_admin_cannot_deduct_more_than_current_stock(self):
        self.client.force_authenticate(user=self.admin_user)
        payload = {"action": "DEDUCT", "quantity": 999}
        response = self.client.post(self.adjust_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_admin_can_create_spare_part(self):
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            "category": self.category_battery.id,
            "part_number": "NEW-PART-01",
            "name": "Intelligent BMS 60V",
            "description": "Smart BMS unit with CANbus",
            "price": "1800.00",
            "stock_quantity": 20,
            "low_stock_threshold": 5,
            "is_active": True
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        part = SparePart.objects.get(part_number="NEW-PART-01")
        self.assertEqual(part.stock_status, SparePart.StockStatus.IN_STOCK)

    def test_customer_forbidden_from_adjusting_stock(self):
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.post(self.adjust_url, {"action": "ADD", "quantity": 10}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_low_stock_alert_action(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.low_stock_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        # part_low_stock (3 <= 5) and part_out_of_stock (0 <= 5)
        part_numbers = [p['part_number'] for p in response.data['data']]
        self.assertIn('TEST-BRK-CALIPER', part_numbers)
        self.assertIn('TEST-BRK-PAD', part_numbers)
        self.assertNotIn('TEST-BAT-72V', part_numbers)

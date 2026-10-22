from decimal import Decimal
from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.vehicles.models import VehicleCategory, VehicleModel, VehicleVariant
from apps.bookings.models import TestRideBooking

User = get_user_model()

class TestRideBookingAPITests(APITestCase):
    def setUp(self):
        # 1. Users
        self.admin_user = User.objects.create_superuser(
            email='admin@voltixev.com',
            username='admin_booking',
            password='AdminPassword123!',
            role=User.Role.ADMIN
        )
        self.customer1 = User.objects.create_user(
            email='customer1@example.com',
            username='customer1',
            password='Password123!',
            role=User.Role.CUSTOMER
        )
        self.customer2 = User.objects.create_user(
            email='customer2@example.com',
            username='customer2',
            password='Password123!',
            role=User.Role.CUSTOMER
        )

        # 2. Vehicle
        self.category = VehicleCategory.objects.create(name='High Speed Scooter', slug='high-speed')
        self.model = VehicleModel.objects.create(category=self.category, name='SE', slug='se-model')
        self.variant = VehicleVariant.objects.create(
            model=self.model,
            name='SE Pro',
            sku='TEST-BK-SE-PRO',
            base_price=Decimal('97999.00'),
            is_active=True
        )

        self.tomorrow = timezone.now().date() + timedelta(days=1)
        self.slot = TestRideBooking.TimeSlot.SLOT_10_11

        self.list_url = reverse('bookings:booking-list')
        self.slots_url = reverse('bookings:booking-available-slots')

    def test_successful_test_ride_booking(self):
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "variant_id": self.variant.id,
            "booking_date": str(self.tomorrow),
            "time_slot": self.slot,
            "contact_phone": "9876543210",
            "driving_license_number": "MH01202612345"
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('booking_reference', response.data['data'])
        self.assertEqual(response.data['data']['status'], 'PENDING')
        self.assertEqual(response.data['data']['variant_name'], 'SE Pro')

    def test_double_booking_conflict_prevention_fails(self):
        # Customer 1 books the slot first
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "variant_id": self.variant.id,
            "booking_date": str(self.tomorrow),
            "time_slot": self.slot,
            "contact_phone": "9876543210",
            "driving_license_number": "MH01202612345"
        }
        res1 = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Customer 2 attempts to book the same vehicle, date, and slot
        self.client.force_authenticate(user=self.customer2)
        res2 = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res2.data['success'])
        self.assertIn("already booked", str(res2.data['error']))

    def test_past_date_booking_fails(self):
        self.client.force_authenticate(user=self.customer1)
        yesterday = timezone.now().date() - timedelta(days=1)
        payload = {
            "variant_id": self.variant.id,
            "booking_date": str(yesterday),
            "time_slot": self.slot,
            "contact_phone": "9876543210",
            "driving_license_number": "MH01202612345"
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_customer_can_view_own_bookings_only(self):
        # Customer 1 creates a booking
        b1 = TestRideBooking.objects.create(
            customer=self.customer1,
            variant=self.variant,
            booking_date=self.tomorrow,
            time_slot=self.slot,
            contact_phone="9876543210",
            driving_license_number="DL01"
        )
        # Customer 2 creates a booking on a different slot
        b2 = TestRideBooking.objects.create(
            customer=self.customer2,
            variant=self.variant,
            booking_date=self.tomorrow,
            time_slot=TestRideBooking.TimeSlot.SLOT_14_15,
            contact_phone="9876543211",
            driving_license_number="DL02"
        )

        # Customer 1 views list
        self.client.force_authenticate(user=self.customer1)
        res1 = self.client.get(self.list_url)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        ids = [b['id'] for b in res1.data['data']]
        self.assertIn(b1.id, ids)
        self.assertNotIn(b2.id, ids)

        # Customer 1 attempts to retrieve Customer 2's booking detail
        detail_url_b2 = reverse('bookings:booking-detail', kwargs={'pk': b2.pk})
        res_forbidden = self.client.get(detail_url_b2)
        self.assertEqual(res_forbidden.status_code, status.HTTP_404_NOT_FOUND)

    def test_customer_can_cancel_eligible_booking(self):
        b1 = TestRideBooking.objects.create(
            customer=self.customer1,
            variant=self.variant,
            booking_date=self.tomorrow,
            time_slot=self.slot,
            contact_phone="9876543210",
            driving_license_number="DL01",
            status=TestRideBooking.Status.PENDING
        )
        self.client.force_authenticate(user=self.customer1)
        cancel_url = reverse('bookings:booking-cancel', kwargs={'pk': b1.pk})
        response = self.client.patch(cancel_url, {"cancellation_reason": "Schedule conflict"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['status'], 'CANCELLED')

        b1.refresh_from_db()
        self.assertEqual(b1.status, TestRideBooking.Status.CANCELLED)

    def test_customer_cannot_cancel_completed_booking(self):
        b1 = TestRideBooking.objects.create(
            customer=self.customer1,
            variant=self.variant,
            booking_date=self.tomorrow,
            time_slot=self.slot,
            contact_phone="9876543210",
            driving_license_number="DL01",
            status=TestRideBooking.Status.COMPLETED
        )
        self.client.force_authenticate(user=self.customer1)
        cancel_url = reverse('bookings:booking-cancel', kwargs={'pk': b1.pk})
        response = self.client.patch(cancel_url, {"cancellation_reason": "Too late"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_cancelled_slot_becomes_available_for_new_booking(self):
        # 1. Customer 1 books and cancels
        b1 = TestRideBooking.objects.create(
            customer=self.customer1,
            variant=self.variant,
            booking_date=self.tomorrow,
            time_slot=self.slot,
            contact_phone="9876543210",
            driving_license_number="DL01",
            status=TestRideBooking.Status.CANCELLED
        )

        # 2. Customer 2 books the same vehicle, date, and slot
        self.client.force_authenticate(user=self.customer2)
        payload = {
            "variant_id": self.variant.id,
            "booking_date": str(self.tomorrow),
            "time_slot": self.slot,
            "contact_phone": "9876543211",
            "driving_license_number": "DL02TEST"
        }

        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])

    def test_admin_can_view_all_and_update_status(self):
        b1 = TestRideBooking.objects.create(
            customer=self.customer1,
            variant=self.variant,
            booking_date=self.tomorrow,
            time_slot=self.slot,
            contact_phone="9876543210",
            driving_license_number="DL01",
            status=TestRideBooking.Status.PENDING
        )
        self.client.force_authenticate(user=self.admin_user)
        res_list = self.client.get(self.list_url)
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_list.data['data']), 1)

        # Admin confirms booking
        update_url = reverse('bookings:booking-update-status', kwargs={'pk': b1.pk})
        res_update = self.client.patch(update_url, {
            "status": "CONFIRMED",
            "admin_notes": "Customer confirmed over phone call"
        }, format='json')
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.assertEqual(res_update.data['data']['status'], 'CONFIRMED')

    def test_slot_availability_endpoint(self):
        # Book one slot
        TestRideBooking.objects.create(
            customer=self.customer1,
            variant=self.variant,
            booking_date=self.tomorrow,
            time_slot=self.slot,
            contact_phone="9876543210",
            driving_license_number="DL01",
            status=TestRideBooking.Status.CONFIRMED
        )
        url = f"{self.slots_url}?variant_id={self.variant.id}&date={str(self.tomorrow)}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        slots = response.data['data']['slots']
        for s in slots:
            if s['slot'] == self.slot:
                self.assertFalse(s['is_available'])
            else:
                self.assertTrue(s['is_available'])

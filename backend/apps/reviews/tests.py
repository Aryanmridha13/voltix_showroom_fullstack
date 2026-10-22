"""
Unit and Integration Tests for Reviews and Ratings Module.
"""
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.vehicles.models import VehicleCategory, VehicleModel, VehicleVariant
from apps.bookings.models import TestRideBooking
from apps.reviews.models import VehicleReview

User = get_user_model()


class ReviewTests(APITestCase):
    def setUp(self):
        # 1. Create Users
        self.admin_user = User.objects.create_superuser(
            email='admin@voltix.test',
            username='admin_test',
            password='AdminPassword123'
        )
        self.customer1 = User.objects.create_user(
            email='cust1@voltix.test',
            username='cust1_test',
            password='CustomerPassword123',
            role=User.Role.CUSTOMER,
            first_name='Karan',
            last_name='Singhania'
        )
        self.customer2 = User.objects.create_user(
            email='cust2@voltix.test',
            username='cust2_test',
            password='CustomerPassword123',
            role=User.Role.CUSTOMER,
            first_name='Pooja',
            last_name='Hegde'
        )

        # 2. Create Vehicle Hierarchy
        self.category = VehicleCategory.objects.create(
            name='Electric Motorcycle',
            slug='electric-motorcycle-test',
            description='Test Category'
        )
        self.model = VehicleModel.objects.create(
            category=self.category,
            name='Voltix Falcon',
            slug='voltix-falcon-test',
            tagline='Pure electric performance'
        )
        self.variant = VehicleVariant.objects.create(
            model=self.model,
            name='Falcon GT',
            sku='TEST-FALCON-GT',
            base_price=Decimal('185000.00'),
            is_active=True
        )
        self.variant2 = VehicleVariant.objects.create(
            model=self.model,
            name='Falcon Base',
            sku='TEST-FALCON-BASE',
            base_price=Decimal('145000.00'),
            is_active=True
        )

        self.list_url = reverse('reviews:review-list')

    def test_customer_can_create_review(self):
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "variant_id": self.variant.id,
            "rating": 5,
            "title": "Incredible acceleration and handling",
            "comment": "The riding posture is super comfortable and range is true to specs."
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['rating'], 5)
        self.assertEqual(response.data['title'], payload['title'])
        self.assertEqual(response.data['variant']['id'], self.variant.id)
        self.assertEqual(response.data['moderation_status'], 'APPROVED')

    def test_rating_bounds_validation(self):
        self.client.force_authenticate(user=self.customer1)
        # Rating 0 (too low)
        res_zero = self.client.post(self.list_url, {
            "variant_id": self.variant.id,
            "rating": 0,
            "title": "Valid Title",
            "comment": "Long enough comment for validation test."
        })
        self.assertEqual(res_zero.status_code, status.HTTP_400_BAD_REQUEST)

        # Rating 6 (too high)
        res_six = self.client.post(self.list_url, {
            "variant_id": self.variant.id,
            "rating": 6,
            "title": "Valid Title",
            "comment": "Long enough comment for validation test."
        })
        self.assertEqual(res_six.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_review_for_same_variant_prevented(self):
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "variant_id": self.variant.id,
            "rating": 4,
            "title": "First review title",
            "comment": "Solid build quality and great dashboard."
        }
        res1 = self.client.post(self.list_url, payload)
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Second attempt on same variant
        res2 = self.client.post(self.list_url, payload)
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('variant_id', res2.data.get('error', {}).get('details', res2.data))

    def test_verified_rider_badge_automatically_detected(self):
        # Create completed booking for customer1 on variant
        TestRideBooking.objects.create(
            customer=self.customer1,
            variant=self.variant,
            booking_date='2026-05-10',
            time_slot='10:00-11:00',
            driving_license_number='DL-99887766',
            contact_phone='+919876543201',
            status=TestRideBooking.Status.COMPLETED
        )

        self.client.force_authenticate(user=self.customer1)
        payload = {
            "variant_id": self.variant.id,
            "rating": 5,
            "title": "Tested and Verified",
            "comment": "Took a 45 min test ride, performance blew me away."
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['is_verified_rider'])

    def test_unverified_rider_when_no_completed_booking(self):
        self.client.force_authenticate(user=self.customer2)
        payload = {
            "variant_id": self.variant.id,
            "rating": 4,
            "title": "Impression without test ride",
            "comment": "Looked at specs and showroom model, looks promising."
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data['is_verified_rider'])

    def test_public_only_sees_approved_reviews(self):
        # Create approved review
        VehicleReview.objects.create(
            customer=self.customer1,
            variant=self.variant,
            rating=5,
            title='Approved Review',
            comment='Visible to all public visitors.',
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )
        # Create pending review
        VehicleReview.objects.create(
            customer=self.customer2,
            variant=self.variant2,
            rating=3,
            title='Pending Review',
            comment='Under moderation review queue.',
            moderation_status=VehicleReview.ModerationStatus.PENDING
        )

        # Anonymous request
        self.client.logout()
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        items = res.data.get('data', res.data.get('results', []))
        titles = [r['title'] for r in items]
        self.assertIn('Approved Review', titles)
        self.assertNotIn('Pending Review', titles)

    def test_admin_can_moderate_review(self):
        review = VehicleReview.objects.create(
            customer=self.customer1,
            variant=self.variant,
            rating=1,
            title='Spam Title',
            comment='This contains inappropriate promotional content.',
            moderation_status=VehicleReview.ModerationStatus.PENDING
        )

        moderate_url = reverse('reviews:review-moderate', kwargs={'pk': review.id})

        # Customer cannot moderate
        self.client.force_authenticate(user=self.customer1)
        res_forbidden = self.client.patch(moderate_url, {"status": "REJECTED"})
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can moderate
        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.patch(moderate_url, {
            "status": "REJECTED",
            "notes": "Violated terms of service (promotional spam)."
        })
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(res_admin.data['moderation_status'], 'REJECTED')

        review.refresh_from_db()
        self.assertEqual(review.moderation_status, VehicleReview.ModerationStatus.REJECTED)
        self.assertEqual(review.moderated_by, self.admin_user)

    def test_owner_can_update_own_review(self):
        review = VehicleReview.objects.create(
            customer=self.customer1,
            variant=self.variant,
            rating=4,
            title='Good bike',
            comment='Good bike after 100km of riding daily.',
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )
        detail_url = reverse('reviews:review-detail', kwargs={'pk': review.id})

        self.client.force_authenticate(user=self.customer1)
        res = self.client.patch(detail_url, {
            "rating": 5,
            "title": "Even better than initial impression!"
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rating'], 5)
        self.assertEqual(res.data['title'], "Even better than initial impression!")

    def test_non_owner_cannot_update_review(self):
        review = VehicleReview.objects.create(
            customer=self.customer1,
            variant=self.variant,
            rating=4,
            title='Customer 1 Review',
            comment='Review by customer 1 only.',
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )
        detail_url = reverse('reviews:review-detail', kwargs={'pk': review.id})

        self.client.force_authenticate(user=self.customer2)
        res = self.client.patch(detail_url, {"title": "Malicious edit attempt"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_variant_rating_stats_endpoint(self):
        # 3 approved reviews: 5, 5, 4 stars -> avg = 4.7
        VehicleReview.objects.create(
            customer=self.customer1,
            variant=self.variant,
            rating=5,
            title='Great',
            comment='Long detailed review comments here.',
            is_verified_rider=True,
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )
        VehicleReview.objects.create(
            customer=self.customer2,
            variant=self.variant,
            rating=5,
            title='Loved it',
            comment='Another great detailed feedback.',
            is_verified_rider=False,
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )
        # Create third customer for 3rd review
        c3 = User.objects.create_user(
            email='c3@voltix.test',
            username='c3_test',
            password='Password123'
        )
        VehicleReview.objects.create(
            customer=c3,
            variant=self.variant,
            rating=4,
            title='Good ride',
            comment='Review with 4 star rating.',
            is_verified_rider=True,
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )

        stats_url = reverse('reviews:review-stats', kwargs={'variant_id': self.variant.id})
        res = self.client.get(stats_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_reviews'], 3)
        self.assertEqual(res.data['average_rating'], 4.7)
        self.assertEqual(res.data['verified_riders_count'], 2)
        self.assertEqual(res.data['rating_distribution']['5_star'], 2)
        self.assertEqual(res.data['rating_distribution']['4_star'], 1)

    def test_my_reviews_endpoint(self):
        VehicleReview.objects.create(
            customer=self.customer1,
            variant=self.variant,
            rating=5,
            title='My Own Review',
            comment='Detailed review written by customer 1.',
            moderation_status=VehicleReview.ModerationStatus.APPROVED
        )

        my_url = reverse('reviews:review-my-reviews')
        self.client.force_authenticate(user=self.customer1)
        res = self.client.get(my_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        items = res.data.get('data', res.data.get('results', []))
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['title'], 'My Own Review')

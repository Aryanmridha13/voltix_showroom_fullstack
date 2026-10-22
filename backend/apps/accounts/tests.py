from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.register_url = reverse('accounts:register')
        self.login_url = reverse('accounts:login')
        self.refresh_url = reverse('accounts:token-refresh')
        self.me_url = reverse('accounts:current-user')

        # Create a test customer user
        self.customer_user = User.objects.create_user(
            email='customer@example.com',
            username='evcustomer1',
            password='StrongPassword123!',
            first_name='Rahul',
            last_name='Sharma',
            role=User.Role.CUSTOMER
        )

        # Create a test admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@voltixev.com',
            username='admin1',
            password='AdminPassword123!',
            first_name='System',
            last_name='Admin'
        )

    def test_customer_registration_success(self):
        payload = {
            "email": "newcustomer@example.com",
            "username": "newcustomer",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Priya",
            "last_name": "Patel",
            "phone_number": "9876543210",
            "city": "Mumbai",
            "driving_license_number": "MH0120260012345"
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['user']['role'], 'CUSTOMER')
        self.assertIn('tokens', response.data['data'])
        self.assertIn('access', response.data['data']['tokens'])

        # Verify database record
        user = User.objects.get(email="newcustomer@example.com")
        self.assertEqual(user.profile.city, "Mumbai")
        self.assertEqual(user.profile.driving_license_number, "MH0120260012345")

    def test_registration_password_mismatch_fails(self):
        payload = {
            "email": "mismatch@example.com",
            "username": "mismatchuser",
            "password": "Password123!",
            "password_confirm": "DifferentPassword123!"
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'VALIDATION_ERROR')

    def test_registration_duplicate_email_fails(self):
        payload = {
            "email": "customer@example.com",  # Already exists from setUp
            "username": "uniqueusername",
            "password": "Password123!",
            "password_confirm": "Password123!"
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_login_success(self):
        payload = {
            "email": "customer@example.com",
            "password": "StrongPassword123!"
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])
        self.assertEqual(response.data['data']['user']['email'], "customer@example.com")
        self.assertEqual(response.data['data']['user']['role'], "CUSTOMER")

    def test_login_invalid_credentials_fails(self):
        payload = {
            "email": "customer@example.com",
            "password": "WrongPassword999!"
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_token_refresh(self):
        login_res = self.client.post(self.login_url, {
            "email": "customer@example.com",
            "password": "StrongPassword123!"
        }, format='json')
        refresh_token = login_res.data['data']['refresh']

        refresh_res = self.client.post(self.refresh_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertTrue(refresh_res.data['success'])
        self.assertIn('access', refresh_res.data['data'])

    def test_current_user_profile_authenticated(self):
        # Authenticate via client credentials
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], "customer@example.com")
        self.assertEqual(response.data['data']['role'], "CUSTOMER")

    def test_current_user_profile_unauthenticated_fails(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error']['code'], 'AUTHENTICATION_REQUIRED')

    def test_update_profile(self):
        self.client.force_authenticate(user=self.customer_user)
        patch_payload = {
            "first_name": "Rahul Ji",
            "phone_number": "9988776655",
            "profile": {
                "city": "Bengaluru",
                "driving_license_number": "KA0120269988776"
            }
        }
        response = self.client.patch(self.me_url, patch_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['first_name'], "Rahul Ji")
        self.assertEqual(response.data['data']['phone_number'], "9988776655")

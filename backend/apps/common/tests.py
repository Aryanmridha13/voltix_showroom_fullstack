from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.template.context import BaseContext

# Python 3.14 compatibility patch for Django Context copy
def _safe_context_copy(self):
    obj = self.__class__.__new__(self.__class__)
    obj.__dict__.update(self.__dict__)
    obj.dicts = self.dicts[:]
    return obj

BaseContext.__copy__ = _safe_context_copy


class SystemAndDocsTests(APITestCase):
    def test_health_check_endpoint(self):
        url = reverse('common:health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['status'], 'healthy')
        self.assertEqual(response.data['data']['database']['engine'], 'MySQL 8.0')
        self.assertEqual(response.data['data']['database']['status'], 'connected')

    def test_openapi_schema_endpoint(self):
        url = reverse('schema')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify OpenAPI 3 specification structure
        self.assertIn('openapi', response.data)
        self.assertTrue(response.data['openapi'].startswith('3.'))
        self.assertEqual(response.data['info']['title'], 'Voltix EV Motors Showroom API')
        self.assertIn('paths', response.data)
        # Check that key resource paths are present in schema
        paths = response.data['paths']
        self.assertIn('/api/v1/auth/login/', paths)
        self.assertIn('/api/v1/vehicles/variants/', paths)
        self.assertIn('/api/v1/customizer/colours/', paths)
        self.assertIn('/api/v1/parts/items/', paths)
        self.assertIn('/api/v1/bookings/', paths)
        self.assertIn('/api/v1/reviews/', paths)

    def test_swagger_ui_endpoint(self):
        url = reverse('swagger-ui')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(b'swagger-ui', response.content.lower())

    def test_redoc_ui_endpoint(self):
        url = reverse('redoc')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(b'redoc', response.content.lower())

    def test_custom_404_json_envelope(self):
        response = self.client.get('/api/v1/completely-invalid-endpoint/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = response.json()
        self.assertFalse(data.get('success', True))
        self.assertEqual(data.get('error', {}).get('code'), 'RESOURCE_NOT_FOUND')

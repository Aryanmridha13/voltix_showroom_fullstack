from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
)

class RegisterView(APIView):
    """
    Public registration endpoint for new showroom customers.
    Automatically provisions user credentials, profile, and initial JWT tokens.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Register Customer Account",
        description="Creates a new customer account with profile details and issues JWT tokens.",
        tags=["Authentication & Profile"],
        request=UserRegistrationSerializer,
        responses={
            201: OpenApiResponse(description="Registration successful"),
            400: OpenApiResponse(description="Validation error")
        }
    )
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT Tokens for immediate access
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['username'] = user.username
        refresh['role'] = user.role
        refresh['full_name'] = f"{user.first_name} {user.last_name}".strip()

        return Response(
            {
                "success": True,
                "message": "Customer account registered successfully.",
                "data": {
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    }
                }
            },
            status=status.HTTP_201_CREATED
        )


class CustomLoginView(TokenObtainPairView):
    """
    Authentication endpoint returning access & refresh JWT tokens
    plus sanitized user profile and role metadata.
    """
    serializer_class = CustomTokenObtainPairSerializer

    @extend_schema(
        summary="Customer / Admin Login",
        description="Authenticates via email/username and password. Returns JWT tokens and user profile.",
        tags=["Authentication & Profile"],
        responses={
            200: OpenApiResponse(description="Login successful"),
            401: OpenApiResponse(description="Invalid credentials")
        }
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            data = response.data
            response.data = {
                "success": True,
                "message": "Authentication successful.",
                "data": data
            }
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    Exchanges a valid refresh token for a fresh access token.
    """
    @extend_schema(
        summary="Refresh Access Token",
        description="Provides a new access token using a valid refresh token.",
        tags=["Authentication & Profile"],
        responses={
            200: OpenApiResponse(description="Token refreshed successfully"),
            401: OpenApiResponse(description="Token invalid or expired")
        }
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            response.data = {
                "success": True,
                "message": "Access token refreshed successfully.",
                "data": response.data
            }
        return response


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update currently logged in user profile.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(
        summary="Get Current User Profile",
        tags=["Authentication & Profile"],
        responses={200: UserSerializer}
    )
    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response({
            "success": True,
            "message": "User profile retrieved successfully.",
            "data": serializer.data
        })

    @extend_schema(
        summary="Update Current User Profile",
        tags=["Authentication & Profile"],
        request=UserUpdateSerializer,
        responses={200: UserSerializer}
    )
    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,
            "message": "User profile updated successfully.",
            "data": UserSerializer(self.get_object()).data
        })


class ChangePasswordView(APIView):
    """
    Allows authenticated users to change their account password.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Change Password",
        tags=["Authentication & Profile"],
        request=ChangePasswordSerializer,
        responses={200: OpenApiResponse(description="Password changed successfully")}
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        return Response({
            "success": True,
            "message": "Password changed successfully. Please log in again with your new credentials."
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Stateless JWT Logout endpoint.
    Instructs the frontend to purge stored tokens.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Logout User",
        tags=["Authentication & Profile"],
        request=None,
        responses={
            200: OpenApiResponse(description="Logged out successfully. Purge client tokens.")
        }
    )
    def post(self, request):
        return Response({
            "success": True,
            "message": "Logged out successfully. Purge client tokens."
        }, status=status.HTTP_200_OK)

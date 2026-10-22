from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomerProfile

User = get_user_model()

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = [
            'address',
            'city',
            'state',
            'pincode',
            'driving_license_number',
            'updated_at',
        ]
        read_only_fields = ['updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'role',
            'phone_number',
            'is_staff',
            'profile',
            'created_at',
        ]
        read_only_fields = ['id', 'role', 'is_staff', 'created_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    profile = CustomerProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'phone_number',
            'profile',
        ]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)

        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile fields
        if profile_data and hasattr(instance, 'profile'):
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    city = serializers.CharField(required=False, allow_blank=True, write_only=True, default='')
    driving_license_number = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        default=''
    )

    class Meta:
        model = User
        fields = [
            'email',
            'username',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'phone_number',
            'city',
            'driving_license_number',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Password fields do not match."
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        city = validated_data.pop('city', '')
        driving_license_number = validated_data.pop('driving_license_number', '')

        # Mass assignment protection: Enforce CUSTOMER role
        validated_data['role'] = User.Role.CUSTOMER

        user = User.objects.create_user(**validated_data)

        # Create associated customer profile
        CustomerProfile.objects.create(
            user=user,
            city=city,
            driving_license_number=driving_license_number
        )

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Token Serializer that adds user role and profile metadata
    to both the token claims and the immediate login response payload.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom Claims in JWT Payload
        token['email'] = user.email
        token['username'] = user.username
        token['role'] = user.role
        token['full_name'] = f"{user.first_name} {user.last_name}".strip()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add sanitized user details to response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'phone_number': self.user.phone_number,
        }
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is not correct.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password_confirm": "New password fields do not match."
            })
        return attrs

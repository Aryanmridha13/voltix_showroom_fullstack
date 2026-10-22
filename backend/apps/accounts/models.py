from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimestampedModel

class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field is required.'))
        if not username:
            raise ValueError(_('The Username field is required.'))

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', CustomUser.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, username, password, **extra_fields)


class CustomUser(AbstractUser, TimestampedModel):
    """
    Custom User Model for EV Showroom Management System.
    Supports email authentication and role-based permissions (ADMIN / CUSTOMER).
    """
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Administrator')
        CUSTOMER = 'CUSTOMER', _('Customer')

    email = models.EmailField(
        _('email address'),
        unique=True,
        db_index=True,
        error_messages={'unique': _('A user with that email already exists.')}
    )
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        db_index=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.')
    )
    role = models.CharField(
        _('user role'),
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        db_index=True
    )
    phone_number = models.CharField(
        _('phone number'),
        max_length=15,
        blank=True,
        default=''
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_staff or self.is_superuser

    @property
    def is_customer(self):
        return self.role == self.Role.CUSTOMER


class CustomerProfile(TimestampedModel):
    """
    Detailed customer profile storing showroom-specific data such as
    city, address, and driving license number required for test rides.
    """
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('user')
    )
    address = models.TextField(_('street address'), blank=True, default='')
    city = models.CharField(_('city'), max_length=100, blank=True, default='')
    state = models.CharField(_('state'), max_length=100, blank=True, default='')
    pincode = models.CharField(_('pincode'), max_length=10, blank=True, default='')
    driving_license_number = models.CharField(
        _('driving license number'),
        max_length=50,
        blank=True,
        default='',
        help_text=_('Mandatory for booking test rides.')
    )

    class Meta:
        verbose_name = _('Customer Profile')
        verbose_name_plural = _('Customer Profiles')

    def __str__(self):
        return f"Profile of {self.user.email}"

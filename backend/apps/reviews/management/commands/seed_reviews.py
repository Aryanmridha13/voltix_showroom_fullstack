"""
Seed realistic customer vehicle reviews and feedback.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.vehicles.models import VehicleVariant
from apps.reviews.models import VehicleReview
from apps.bookings.models import TestRideBooking

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with realistic EV reviews, ratings, and verified rider badges."

    def handle(self, *args, **options):
        self.stdout.write("Seeding customer reviews...")

        # 1. Create or get reviewer customers
        reviewers_data = [
            {
                "email": "aarav.patel@example.com",
                "first_name": "Aarav",
                "last_name": "Patel",
                "phone_number": "+919876543201",
            },
            {
                "email": "neha.sharma@example.com",
                "first_name": "Neha",
                "last_name": "Sharma",
                "phone_number": "+919876543202",
            },
            {
                "email": "rohit.verma@example.com",
                "first_name": "Rohit",
                "last_name": "Verma",
                "phone_number": "+919876543203",
            },
            {
                "email": "ananya.iyer@example.com",
                "first_name": "Ananya",
                "last_name": "Iyer",
                "phone_number": "+919876543204",
            },
            {
                "email": "vikram.rao@example.com",
                "first_name": "Vikram",
                "last_name": "Rao",
                "phone_number": "+919876543205",
            },
        ]

        customers = {}
        for rdata in reviewers_data:
            user, _ = User.objects.get_or_create(
                email=rdata["email"],
                defaults={
                    "username": rdata["email"].split('@')[0],
                    "first_name": rdata["first_name"],
                    "last_name": rdata["last_name"],
                    "phone_number": rdata["phone_number"],
                    "role": User.Role.CUSTOMER,
                    "is_active": True,
                }
            )
            if not user.has_usable_password():
                user.set_password("Customer@123")
                user.save()
            customers[rdata["first_name"]] = user

        # 2. Find target variants
        variants = {v.sku: v for v in VehicleVariant.objects.all()}
        if not variants:
            self.stdout.write(self.style.WARNING("No variants found in DB. Run seed_vehicles first."))
            return

        # Predefined realistic reviews
        sample_reviews = [
            {
                "customer_key": "Aarav",
                "sku_options": ["VO-XO-PRO", "VO-XO-STD"],
                "rating": 5,
                "title": "Mind-blowing acceleration and zero vibration!",
                "comment": "Upgraded from an ICE scooter to the Voltix X-One Pro. The hyper mode instant torque of 38 Nm pushes you back in your seat. Suspension handles Indian city potholes like butter.",
                "verified": True,
            },
            {
                "customer_key": "Neha",
                "sku_options": ["VO-XO-PRO", "VO-XO-STD"],
                "rating": 5,
                "title": "True 140km city range on a single charge",
                "comment": "I commute 35 km every day across Bangalore traffic. The regen braking is predictable and adds easily 8-10% charge back on downhill stretches. Fast charging in 45 mins is a lifesaver.",
                "verified": True,
            },
            {
                "customer_key": "Rohit",
                "sku_options": ["VO-SE-ULTRA", "VO-SE-PRO"],
                "rating": 5,
                "title": "The Dual-Motor setup is an absolute beast!",
                "comment": "Took the SE Ultra on a hill climb trail during the weekend. The dual motors distribute power seamlessly with zero wheel spin. The 7-inch TFT dashboard with turn-by-turn navigation works flawlessly.",
                "verified": True,
            },
            {
                "customer_key": "Ananya",
                "sku_options": ["VO-SE-PRO", "VO-SE-STD"],
                "rating": 4,
                "title": "Very comfortable seat ergonomics and build quality",
                "comment": "The fit and finish is top-tier. Pillion comfort is much better than rival electric scooters. Only wish the boot space could hold two full-face helmets instead of one.",
                "verified": False,
            },
            {
                "customer_key": "Vikram",
                "sku_options": ["VO-RNG-DM", "VO-RNG-SM"],
                "rating": 5,
                "title": "Ultimate cruiser with beastly highway stability",
                "comment": "The low center of gravity from the floorboard battery makes highway cruising at 90 km/h rock solid. Regenerative braking paddle shifters make riding in heavy traffic effortless.",
                "verified": True,
            },
        ]

        created_count = 0
        for rev in sample_reviews:
            customer = customers.get(rev["customer_key"])
            if not customer:
                continue

            # Pick matching variant
            target_variant = None
            for sku in rev["sku_options"]:
                if sku in variants:
                    target_variant = variants[sku]
                    break

            if not target_variant:
                # fallback to first available variant
                target_variant = list(variants.values())[0]

            # If verified, ensure completed test ride booking exists
            if rev["verified"]:
                TestRideBooking.objects.get_or_create(
                    customer=customer,
                    variant=target_variant,
                    defaults={
                        "booking_date": "2026-05-10",
                        "time_slot": "10:00-11:00",
                        "driving_license_number": "DL-KA01-20220009988",
                        "contact_phone": customer.phone_number or "+919876543201",
                        "status": TestRideBooking.Status.COMPLETED,
                    }
                )

            review_obj, created = VehicleReview.objects.get_or_create(
                customer=customer,
                variant=target_variant,
                defaults={
                    "rating": rev["rating"],
                    "title": rev["title"],
                    "comment": rev["comment"],
                    "is_verified_rider": rev["verified"],
                    "moderation_status": VehicleReview.ModerationStatus.APPROVED,
                }
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created_count} realistic reviews."))

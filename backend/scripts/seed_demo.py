"""Seed script: creates a demo user, two pets, and 15 ABC logs for demo/testing.

Usage:
    cd backend
    python -m scripts.seed_demo          # uses DATABASE_URL from .env
    python -m scripts.seed_demo --reset  # deletes demo data first, then re-seeds
"""

import argparse
import asyncio
import random
import uuid
from datetime import datetime, timedelta

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_factory, engine

# Deterministic IDs for idempotent seeding
DEMO_USER_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
DEMO_CAT_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
DEMO_DOG_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")

# Sample ABC log scenarios for a cat
CAT_SCENARIOS = [
    {
        "antecedent_category": "environmental_change",
        "antecedent_tags": ["doorbell"],
        "behavior_category": "avoidance",
        "behavior_tags": ["hid", "ran_away"],
        "behavior_severity": 3,
        "consequence_category": "attention_given",
        "consequence_tags": ["went_to_pet"],
        "location": "living_room",
    },
    {
        "antecedent_category": "other_animal",
        "antecedent_tags": ["animal_outside_window"],
        "behavior_category": "vocalization",
        "behavior_tags": ["chattering"],
        "behavior_severity": 1,
        "consequence_category": "environmental_change",
        "consequence_tags": ["nothing_changed"],
        "location": "window_perch",
    },
    {
        "antecedent_category": "resource_related",
        "antecedent_tags": ["dirty_litter_box"],
        "behavior_category": "elimination",
        "behavior_tags": ["urinated_outside_box"],
        "behavior_severity": 4,
        "consequence_category": "verbal_reaction",
        "consequence_tags": ["yelled"],
        "location": "bathroom",
    },
    {
        "antecedent_category": "owner_behavior",
        "antecedent_tags": ["owner_on_phone"],
        "behavior_category": "attention_seeking",
        "behavior_tags": ["sitting_on_keyboard", "pawing_at_owner"],
        "behavior_severity": 2,
        "consequence_category": "attention_given",
        "consequence_tags": ["looked_at_pet", "engaged_with_pet"],
        "location": "bedroom",
    },
    {
        "antecedent_category": "social_pressure",
        "antecedent_tags": ["guest_in_house"],
        "behavior_category": "avoidance",
        "behavior_tags": ["hid", "refused_to_come_out"],
        "behavior_severity": 3,
        "consequence_category": "attention_removed",
        "consequence_tags": ["left_room"],
        "location": "bedroom",
    },
    {
        "antecedent_category": "schedule_disruption",
        "antecedent_tags": ["late_feeding"],
        "behavior_category": "vocalization",
        "behavior_tags": ["excessive_meowing"],
        "behavior_severity": 2,
        "consequence_category": "resource_provided",
        "consequence_tags": ["provided_food"],
        "location": "kitchen",
    },
    {
        "antecedent_category": "environmental_change",
        "antecedent_tags": ["vacuum"],
        "behavior_category": "avoidance",
        "behavior_tags": ["ran_away", "cowered"],
        "behavior_severity": 4,
        "consequence_category": "environmental_change",
        "consequence_tags": ["noise_stopped"],
        "location": "living_room",
    },
    {
        "antecedent_category": "owner_behavior",
        "antecedent_tags": ["picked_up_cat"],
        "behavior_category": "aggression",
        "behavior_tags": ["swatted", "hissed"],
        "behavior_severity": 3,
        "consequence_category": "physical_response",
        "consequence_tags": ["put_down_pet"],
        "location": "living_room",
    },
    {
        "antecedent_category": "resource_related",
        "antecedent_tags": ["feeding_time"],
        "behavior_category": "vocalization",
        "behavior_tags": ["excessive_meowing"],
        "behavior_severity": 2,
        "consequence_category": "resource_provided",
        "consequence_tags": ["provided_food"],
        "location": "kitchen",
    },
    {
        "antecedent_category": "environmental_change",
        "antecedent_tags": ["doorbell"],
        "behavior_category": "avoidance",
        "behavior_tags": ["hid"],
        "behavior_severity": 3,
        "consequence_category": "attention_removed",
        "consequence_tags": ["ignored_behavior"],
        "location": "living_room",
    },
]

# Sample ABC log scenarios for a dog
DOG_SCENARIOS = [
    {
        "antecedent_category": "separation_cues",
        "antecedent_tags": ["picking_up_keys"],
        "behavior_category": "anxiety",
        "behavior_tags": ["pacing", "whining"],
        "behavior_severity": 3,
        "consequence_category": "verbal_reaction",
        "consequence_tags": ["comforted_verbally"],
        "location": "living_room",
    },
    {
        "antecedent_category": "other_animal",
        "antecedent_tags": ["squirrel"],
        "behavior_category": "leash_behavior",
        "behavior_tags": ["pulling", "lunging_at_other_dogs"],
        "behavior_severity": 4,
        "consequence_category": "physical_response",
        "consequence_tags": ["restrained"],
        "location": "walk_route",
    },
    {
        "antecedent_category": "social_situation",
        "antecedent_tags": ["guest_arrival"],
        "behavior_category": "attention_seeking",
        "behavior_tags": ["jumping_on_people"],
        "behavior_severity": 3,
        "consequence_category": "attention_given",
        "consequence_tags": ["engaged_with_pet"],
        "location": "living_room",
    },
    {
        "antecedent_category": "resource_related",
        "antecedent_tags": ["feeding_time", "food_prep"],
        "behavior_category": "vocalization",
        "behavior_tags": ["demand_barking"],
        "behavior_severity": 2,
        "consequence_category": "resource_provided",
        "consequence_tags": ["provided_food"],
        "location": "kitchen",
    },
    {
        "antecedent_category": "environmental_change",
        "antecedent_tags": ["thunderstorm"],
        "behavior_category": "anxiety",
        "behavior_tags": ["trembling", "panting"],
        "behavior_severity": 5,
        "consequence_category": "physical_response",
        "consequence_tags": ["petted_comforted"],
        "location": "bedroom",
    },
]


async def reset_demo_data(session: AsyncSession) -> None:
    """Delete all demo data."""
    uid = DEMO_USER_ID
    await session.execute(text("DELETE FROM insights WHERE user_id = :uid"), {"uid": uid})
    await session.execute(text("DELETE FROM abc_logs WHERE user_id = :uid"), {"uid": uid})
    await session.execute(text("DELETE FROM pets WHERE user_id = :uid"), {"uid": uid})
    await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": uid})
    await session.commit()
    print("Cleared existing demo data.")


async def seed(reset: bool = False) -> None:
    async with async_session_factory() as session:
        if reset:
            await reset_demo_data(session)

        # Check if demo user already exists
        result = await session.execute(
            text("SELECT id FROM users WHERE id = :uid"), {"uid": DEMO_USER_ID}
        )
        if result.scalar_one_or_none():
            print("Demo data already exists. Use --reset to re-seed.")
            return

        # 1. Create demo user
        await session.execute(
            text(
                "INSERT INTO users (id, email, display_name, subscription_tier) "
                "VALUES (:id, :email, :name, :tier)"
            ),
            {
                "id": DEMO_USER_ID,
                "email": "demo@pawlogic.app",
                "name": "Demo User",
                "tier": "premium",
            },
        )
        print("Created demo user: demo@pawlogic.app")

        # 2. Create demo cat
        await session.execute(
            text(
                "INSERT INTO pets (id, user_id, name, species, breed, age_years, sex, is_neutered) "
                "VALUES (:id, :uid, :name, :species, :breed, :age, :sex, :neutered)"
            ),
            {
                "id": DEMO_CAT_ID,
                "uid": DEMO_USER_ID,
                "name": "Whiskers",
                "species": "cat",
                "breed": "Domestic Shorthair",
                "age": 4,
                "sex": "female",
                "neutered": True,
            },
        )
        print("Created demo cat: Whiskers")

        # 3. Create demo dog
        await session.execute(
            text(
                "INSERT INTO pets (id, user_id, name, species, breed, age_years, sex, is_neutered) "
                "VALUES (:id, :uid, :name, :species, :breed, :age, :sex, :neutered)"
            ),
            {
                "id": DEMO_DOG_ID,
                "uid": DEMO_USER_ID,
                "name": "Buddy",
                "species": "dog",
                "breed": "Golden Retriever",
                "age": 3,
                "sex": "male",
                "neutered": True,
            },
        )
        print("Created demo dog: Buddy")

        # 4. Seed ABC logs for the cat (10 logs spread over 30 days)
        now = datetime.now()
        for i, scenario in enumerate(CAT_SCENARIOS):
            occurred = now - timedelta(days=30 - i * 3, hours=random.randint(0, 12))
            await session.execute(
                text(
                    "INSERT INTO abc_logs "
                    "(id, pet_id, user_id, antecedent_category, antecedent_tags, "
                    "behavior_category, behavior_tags, behavior_severity, "
                    "consequence_category, consequence_tags, occurred_at, location) "
                    "VALUES (:id, :pid, :uid, :ac, :at, :bc, :bt, :bs, :cc, :ct, :oa, :loc)"
                ),
                {
                    "id": uuid.uuid4(),
                    "pid": DEMO_CAT_ID,
                    "uid": DEMO_USER_ID,
                    "ac": scenario["antecedent_category"],
                    "at": scenario["antecedent_tags"],
                    "bc": scenario["behavior_category"],
                    "bt": scenario["behavior_tags"],
                    "bs": scenario["behavior_severity"],
                    "cc": scenario["consequence_category"],
                    "ct": scenario["consequence_tags"],
                    "oa": occurred,
                    "loc": scenario["location"],
                },
            )
        print(f"Created {len(CAT_SCENARIOS)} ABC logs for Whiskers (cat)")

        # 5. Seed ABC logs for the dog (5 logs spread over 20 days)
        for i, scenario in enumerate(DOG_SCENARIOS):
            occurred = now - timedelta(days=20 - i * 4, hours=random.randint(0, 12))
            await session.execute(
                text(
                    "INSERT INTO abc_logs "
                    "(id, pet_id, user_id, antecedent_category, antecedent_tags, "
                    "behavior_category, behavior_tags, behavior_severity, "
                    "consequence_category, consequence_tags, occurred_at, location) "
                    "VALUES (:id, :pid, :uid, :ac, :at, :bc, :bt, :bs, :cc, :ct, :oa, :loc)"
                ),
                {
                    "id": uuid.uuid4(),
                    "pid": DEMO_DOG_ID,
                    "uid": DEMO_USER_ID,
                    "ac": scenario["antecedent_category"],
                    "at": scenario["antecedent_tags"],
                    "bc": scenario["behavior_category"],
                    "bt": scenario["behavior_tags"],
                    "bs": scenario["behavior_severity"],
                    "cc": scenario["consequence_category"],
                    "ct": scenario["consequence_tags"],
                    "oa": occurred,
                    "loc": scenario["location"],
                },
            )
        print(f"Created {len(DOG_SCENARIOS)} ABC logs for Buddy (dog)")

        await session.commit()

    await engine.dispose()
    print("\nSeed complete! Demo user credentials:")
    print(f"  User ID: {DEMO_USER_ID}")
    print("  Email:   demo@pawlogic.app")
    print(f"  Cat:     Whiskers ({DEMO_CAT_ID})")
    print(f"  Dog:     Buddy ({DEMO_DOG_ID})")
    print(
        f"  ABC logs: {len(CAT_SCENARIOS)} cat + {len(DOG_SCENARIOS)} dog = {len(CAT_SCENARIOS) + len(DOG_SCENARIOS)} total"
    )
    print(f"  Cat has {len(CAT_SCENARIOS)} logs (>= 10 threshold for pattern detection)")


def main():
    parser = argparse.ArgumentParser(description="Seed PawLogic demo data")
    parser.add_argument("--reset", action="store_true", help="Delete existing demo data first")
    args = parser.parse_args()
    asyncio.run(seed(reset=args.reset))


if __name__ == "__main__":
    main()

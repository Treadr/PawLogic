"""ABA taxonomy constants for the ABC logging engine.

Defines species-specific categories and tags for antecedents, behaviors,
and consequences. These drive validation and the guided entry flow.
"""

# -- Antecedent categories and tags by species --

ANTECEDENT_CATEGORIES: dict[str, dict[str, list[str]]] = {
    "cat": {
        "environmental_change": [
            "doorbell", "loud_noise", "vacuum", "new_furniture",
            "moved_litter_box", "construction", "weather",
        ],
        "other_animal": [
            "dog_nearby", "other_cat_nearby", "animal_outside_window",
            "new_pet_introduced", "stray_cat_outside",
        ],
        "owner_behavior": [
            "owner_leaving", "owner_arrived", "picked_up_cat",
            "woke_cat", "owner_playing", "owner_on_phone",
        ],
        "resource_related": [
            "feeding_time", "empty_food_bowl", "dirty_litter_box",
            "blocked_favorite_spot", "water_bowl_empty", "new_food",
        ],
        "schedule_disruption": [
            "late_feeding", "changed_routine", "new_work_schedule",
            "travel_return", "daylight_saving",
        ],
        "social_pressure": [
            "guest_in_house", "too_much_handling", "cornered",
            "child_interaction", "party_noise",
        ],
        "medical_physical": [
            "post_vet_visit", "medication_time", "grooming",
            "nail_trim", "flea_treatment",
        ],
    },
    "dog": {
        "environmental_change": [
            "doorbell", "loud_noise", "thunderstorm", "new_person",
            "car_ride", "fireworks", "construction",
        ],
        "other_animal": [
            "other_dog", "cat_nearby", "squirrel", "unfamiliar_animal",
            "dog_on_walk", "wildlife",
        ],
        "owner_behavior": [
            "owner_leaving", "owner_arrived", "grabbed_leash",
            "said_no", "owner_eating", "owner_on_phone",
        ],
        "resource_related": [
            "feeding_time", "saw_treat", "toy_visible",
            "bone_present", "food_prep", "water_bowl",
        ],
        "separation_cues": [
            "picking_up_keys", "putting_on_shoes", "grabbing_bag",
            "morning_routine", "coat_on",
        ],
        "social_situation": [
            "dog_park", "walk_encounter", "guest_arrival",
            "child_interaction", "crowded_area",
        ],
        "medical_physical": [
            "post_vet_visit", "grooming", "nail_trim",
            "bath", "medication_time", "injury",
        ],
    },
}

# -- Behavior categories and tags by species --

BEHAVIOR_CATEGORIES: dict[str, dict[str, list[str]]] = {
    "cat": {
        "elimination": [
            "urinated_outside_box", "defecated_outside_box", "spraying",
            "marking", "inappropriate_location",
        ],
        "aggression": [
            "hissed", "swatted", "bit", "growled", "puffed_up",
            "ears_back", "stalking",
        ],
        "destructive": [
            "scratched_furniture", "knocked_items_off", "chewed_cords",
            "tore_up_paper", "damaged_blinds",
        ],
        "vocalization": [
            "excessive_meowing", "yowling", "midnight_vocalizing",
            "chattering", "hissing",
        ],
        "avoidance": [
            "hid", "ran_away", "refused_to_come_out", "cowered",
            "flattened_ears",
        ],
        "attention_seeking": [
            "headbutting", "pawing_at_owner", "jumping_on_counter",
            "sitting_on_keyboard", "blocking_screen",
        ],
        "compulsive": [
            "over_grooming", "wool_sucking", "tail_chasing",
            "pica", "excessive_licking",
        ],
        "inter_pet": [
            "chased_other_pet", "blocked_doorway", "stared_down",
            "ambushed", "resource_guarding",
        ],
    },
    "dog": {
        "elimination": [
            "indoor_urination", "indoor_defecation", "marking",
            "submissive_urination", "excitement_urination",
        ],
        "aggression": [
            "barked_aggressively", "growled", "snapped", "lunged",
            "bit", "showed_teeth", "stiff_body",
        ],
        "destructive": [
            "chewed_furniture", "dug_holes", "destroyed_toys",
            "tore_up_trash", "scratched_door",
        ],
        "vocalization": [
            "excessive_barking", "whining", "howling",
            "demand_barking", "alert_barking",
        ],
        "anxiety": [
            "pacing", "panting", "trembling", "drooling",
            "destructive_when_alone", "following_owner",
        ],
        "attention_seeking": [
            "jumping_on_people", "pawing", "nudging",
            "stealing_items", "demand_barking",
        ],
        "leash_behavior": [
            "pulling", "lunging_at_other_dogs", "reactive_on_leash",
            "refusing_to_walk", "leash_biting",
        ],
        "inter_pet": [
            "resource_guarding", "mounting", "chasing",
            "bullying", "food_aggression",
        ],
    },
}

# -- Consequence categories (shared across species) --

CONSEQUENCE_CATEGORIES: dict[str, list[str]] = {
    "verbal_reaction": [
        "yelled", "said_no", "laughed", "talked_to_pet",
        "comforted_verbally", "whispered",
    ],
    "physical_response": [
        "picked_up_pet", "pushed_away", "petted_comforted",
        "moved_pet", "restrained", "redirected",
    ],
    "attention_given": [
        "looked_at_pet", "went_to_pet", "engaged_with_pet",
        "made_eye_contact", "called_pet",
    ],
    "attention_removed": [
        "ignored_behavior", "walked_away", "left_room",
        "turned_back", "stopped_interaction",
    ],
    "resource_provided": [
        "gave_treat", "gave_toy", "opened_door",
        "provided_food", "let_outside",
    ],
    "resource_removed": [
        "took_away_item", "closed_door", "removed_from_situation",
        "blocked_access", "crated",
    ],
    "other_pet_reaction": [
        "other_pet_retreated", "other_pet_engaged", "other_pet_hid",
        "other_pet_escalated", "no_pet_reaction",
    ],
    "environmental_change": [
        "noise_stopped", "person_left", "door_opened_closed",
        "situation_resolved", "nothing_changed",
    ],
}

# -- Behavior functions (ABA) --

BEHAVIOR_FUNCTIONS = ["attention", "escape", "tangible", "sensory"]

# -- Insight types --

INSIGHT_TYPES = ["pattern", "function", "correlation", "recommendation"]

# -- Severity scale --

SEVERITY_MIN = 1
SEVERITY_MAX = 5
SEVERITY_LABELS = {
    1: "Mild",
    2: "Low-moderate",
    3: "Moderate",
    4: "High-moderate",
    5: "Severe",
}

# -- Location presets --

LOCATIONS = {
    "cat": [
        "living_room", "bedroom", "kitchen", "bathroom",
        "litter_box_area", "window_perch", "cat_tree",
        "hallway", "garage", "patio",
    ],
    "dog": [
        "living_room", "bedroom", "kitchen", "backyard",
        "front_yard", "dog_park", "walk_route",
        "car", "crate", "hallway",
    ],
}


def get_antecedent_categories(species: str) -> dict[str, list[str]]:
    """Return antecedent categories for a given species."""
    return ANTECEDENT_CATEGORIES.get(species, {})


def get_behavior_categories(species: str) -> dict[str, list[str]]:
    """Return behavior categories for a given species."""
    return BEHAVIOR_CATEGORIES.get(species, {})


def get_all_antecedent_tags(species: str) -> set[str]:
    """Return all valid antecedent tags for a species."""
    tags: set[str] = set()
    for cat_tags in ANTECEDENT_CATEGORIES.get(species, {}).values():
        tags.update(cat_tags)
    return tags


def get_all_behavior_tags(species: str) -> set[str]:
    """Return all valid behavior tags for a species."""
    tags: set[str] = set()
    for cat_tags in BEHAVIOR_CATEGORIES.get(species, {}).values():
        tags.update(cat_tags)
    return tags


def get_all_consequence_tags() -> set[str]:
    """Return all valid consequence tags."""
    tags: set[str] = set()
    for cat_tags in CONSEQUENCE_CATEGORIES.values():
        tags.update(cat_tags)
    return tags

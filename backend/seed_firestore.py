"""Seed logistics skill metadata and curated learning links (never demo jobs/users)."""
from services.firebase import firestore_client

SKILLS = [
    ("warehouse-operations", "Warehouse Operations", "warehouse"),
    ("wms", "Warehouse Management Systems (WMS)", "warehouse"),
    ("inventory-control", "Inventory Control", "warehouse"),
    ("forklift-safety", "Forklift Safety", "warehouse"),
    ("fleet-operations", "Fleet Operations", "fleet"),
    ("route-planning", "Route Planning", "driver"),
    ("defensive-driving", "Defensive Driving", "driver"),
    ("vehicle-maintenance", "Vehicle Maintenance", "vehicle"),
    ("cargo-handling", "Cargo Handling", "cargo"),
    ("cold-chain", "Cold Chain Handling", "cargo"),
    ("digital-documentation", "Digital Documentation", "workforce"),
    ("supply-chain", "Supply Chain Operations", "workforce"),
    ("communication", "Workplace Communication", "workforce"),
    ("occupational-safety", "Occupational Safety", "workforce"),
]

COURSES = [
    ("warehouse-foundation", "Warehouse Operations Foundation", "Skill India Digital", "Government / Public", "WMS, Warehouse Operations", "Beginner", "https://skillindiadigital.gov.in/"),
    ("supply-chain-essentials", "Logistics and Supply Chain Essentials", "NSDC", "Government / Public", "Inventory Management, Supply Chain Operations", "Intermediate", "https://nsdcindia.org/"),
    ("cold-chain-basics", "Cold Chain Handling Basics", "eSkill India", "Government / Public", "Cold Chain Handling, Cargo Handling", "Intermediate", "https://eskillindia.org/"),
    ("logistics-documentation", "Digital Documentation for Logistics", "SWAYAM", "Government / Public", "Digital Documentation, Warehouse Operations", "Beginner", "https://swayam.gov.in/"),
    ("logistics-management", "Introduction to Logistics Management", "NPTEL", "Government / Public", "Route Planning, Fleet Operations", "Intermediate", "https://nptel.ac.in/"),
    ("operations-analytics", "Data Analytics for Operations", "Microsoft Learn", "Industry / Professional", "Data Analytics, Inventory Control", "Intermediate", "https://learn.microsoft.com/"),
    ("warehouse-systems", "Warehouse Management System Essentials", "SAP Learning", "Industry / Professional", "WMS, Warehouse Operations", "Intermediate", "https://training.sap.com/"),
    ("supply-chain-planning", "Supply Chain Operations and Planning", "IBM SkillsBuild", "Industry / Professional", "Supply Chain Operations, Inventory Control", "Intermediate", "https://www.ibm.com/training/"),
]


def seed():
    db = firestore_client()
    batch = db.batch()
    for key, name, category in SKILLS:
        ref = db.collection("skills").document(key)
        if not ref.get().exists:
            batch.set(ref, {"name": name, "category": category})
    for key, title, provider, kind, skills, level, url in COURSES:
        ref = db.collection("learningResources").document(key)
        if not ref.get().exists:
            batch.set(ref, {
                "title": title,
                "platform": provider,
                "type": kind,
                "skills": [value.strip() for value in skills.split(",")],
                "difficulty": level,
                "url": url,
                "description": "Open the provider's official catalogue to confirm current availability, content and certification.",
            })
    batch.commit()
    print("Seeded missing logistics skills and curated learning catalogue entries.")


if __name__ == "__main__":
    seed()

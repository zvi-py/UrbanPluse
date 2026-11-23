"""
Database Seeding Script for UrbanPulse Student Community Agent.

Populates realistic sample students, study groups, memberships, and hackathon opportunities
so you can immediately demo and test the platform with rich, connected data.
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal, Base, engine
from app.models.student import Student
from app.models.community import Community, CommunityMember
from app.models.opportunity import Opportunity, OpportunityBookmark


def seed_database():
    print("🌱 Initializing UrbanPulse SQLite database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Student).count() > 0:
            print("ℹ️ Database already contains records. Clearing existing records for clean seeding...")
            db.query(OpportunityBookmark).delete()
            db.query(CommunityMember).delete()
            db.query(Opportunity).delete()
            db.query(Community).delete()
            db.query(Student).delete()
            db.commit()

        print("🧑‍🎓 Seeding sample students...")
        students_data = [
            {
                "full_name": "Maya Lin",
                "email": "maya.lin@urbanpulse.edu",
                "college_name": "Urban College of Engineering",
                "department": "Computer Science",
                "year_of_study": 3,
                "skills": ["Python", "FastAPI", "PyTorch", "Docker"],
                "interests": ["Artificial Intelligence", "Autonomous Systems", "Smart Cities"],
                "bio": "Junior researching multi-agent architectures and smart campus infrastructure."
            },
            {
                "full_name": "Devon Miles",
                "email": "devon.m@urbanpulse.edu",
                "college_name": "Institute of Smart Cities",
                "department": "Internet of Things",
                "year_of_study": 4,
                "skills": ["Embedded C", "Python", "MQTT", "ESP32", "LoRaWAN"],
                "interests": ["Smart Campus", "Sensors", "Urban Tech", "Hardware Hacking"],
                "bio": "Final-year hardware engineer deploying real-time sensor nodes across campus."
            },
            {
                "full_name": "Chloe Chen",
                "email": "chloe.c@urbanpulse.edu",
                "college_name": "Urban Design & Tech Academy",
                "department": "Human-Computer Interaction",
                "year_of_study": 2,
                "skills": ["Figma", "React", "TypeScript", "TailwindCSS"],
                "interests": ["UI/UX Design", "Accessibility", "Design Systems", "Web Development"],
                "bio": "Sophomore crafting accessible UI components and design systems for campus apps."
            },
            {
                "full_name": "Alex Johnson",
                "email": "alex.j@urbanpulse.edu",
                "college_name": "Urban College of Engineering",
                "department": "Data Science",
                "year_of_study": 3,
                "skills": ["Python", "Pandas", "Scikit-Learn", "FastAPI"],
                "interests": ["Artificial Intelligence", "Data Engineering", "Smart Cities"],
                "bio": "Building predictive traffic models and campus resource optimization analytics."
            },
            {
                "full_name": "Marcus Vance",
                "email": "marcus.v@urbanpulse.edu",
                "college_name": "Urban College of Engineering",
                "department": "Robotics Engineering",
                "year_of_study": 3,
                "skills": ["C++", "ROS", "Python", "Gazebo"],
                "interests": ["Robotics", "Drones", "Autonomous Systems"],
                "bio": "Prototyping autonomous delivery rovers and drone landing systems."
            },
            {
                "full_name": "Priya Sharma",
                "email": "priya.s@urbanpulse.edu",
                "college_name": "Urban College of Engineering",
                "department": "Computer Science",
                "year_of_study": 3,
                "skills": ["React", "FastAPI", "PostgreSQL", "Docker", "Python"],
                "interests": ["Hackathons", "Open Source", "Web Development"],
                "bio": "Full-stack developer and hackathon enthusiast leading civic tech initiatives."
            },
            {
                "full_name": "Sarah Connor",
                "email": "sarah.c@urbanpulse.edu",
                "college_name": "Institute of Smart Cities",
                "department": "Cybersecurity",
                "year_of_study": 4,
                "skills": ["Linux", "Docker", "Wireshark", "Python", "Go"],
                "interests": ["Cloud Security", "Network Forensics", "IoT Security"],
                "bio": "Auditing smart meters and securing campus API gateways."
            },
            {
                "full_name": "Liam Scott",
                "email": "liam.s@urbanpulse.edu",
                "college_name": "Urban College of Engineering",
                "department": "General Engineering",
                "year_of_study": 1,
                "skills": ["Python", "Git"],
                "interests": ["Artificial Intelligence", "Hackathons"],
                "bio": "Freshman enthusiastic about coding and joining first hackathon squad."
            }
        ]

        created_students = {}
        for s_data in students_data:
            s = Student(**s_data)
            db.add(s)
            db.commit()
            db.refresh(s)
            created_students[s.full_name] = s

        print(f"✅ Created {len(created_students)} student profiles.")

        print("👥 Seeding study groups & student communities...")
        communities_data = [
            {
                "name": "UrbanPulse AI & Mobility Lab",
                "description": "Cross-disciplinary project group developing autonomous navigation and traffic intelligence.",
                "category": "Project Team",
                "topic_tags": ["Artificial Intelligence", "Autonomous Systems", "Python", "Smart Cities"],
                "creator": created_students["Maya Lin"],
                "members": [created_students["Alex Johnson"], created_students["Marcus Vance"]]
            },
            {
                "name": "Campus IoT & Hardware Guild",
                "description": "Hardware hackers building micro-climate sensors, solar monitors, and LoRaWAN gateways.",
                "category": "Study Group",
                "topic_tags": ["Smart Campus", "Sensors", "Embedded C", "Hardware Hacking", "Python"],
                "creator": created_students["Devon Miles"],
                "members": [created_students["Sarah Connor"], created_students["Marcus Vance"]]
            },
            {
                "name": "Full-Stack Civic Hackers",
                "description": "Fast-paced squad building civic tech MVPs for campus and city hackathons.",
                "category": "Hackathon Squad",
                "topic_tags": ["Hackathons", "React", "FastAPI", "Python", "Web Development"],
                "creator": created_students["Priya Sharma"],
                "members": [created_students["Chloe Chen"], created_students["Liam Scott"]]
            },
            {
                "name": "Cyber Defense & Cloud Security Club",
                "description": "Weekly CTF challenges, threat modeling, and securing campus cloud infrastructure.",
                "category": "Club",
                "topic_tags": ["Cloud Security", "Linux", "Docker", "Network Forensics"],
                "creator": created_students["Sarah Connor"],
                "members": [created_students["Devon Miles"]]
            }
        ]

        created_communities = {}
        for c_data in communities_data:
            comm = Community(
                name=c_data["name"],
                description=c_data["description"],
                category=c_data["category"],
                topic_tags=c_data["topic_tags"],
                created_by_student_id=c_data["creator"].id
            )
            db.add(comm)
            db.commit()
            db.refresh(comm)

            # Creator as admin
            admin_membership = CommunityMember(
                community_id=comm.id,
                student_id=c_data["creator"].id,
                role="admin"
            )
            db.add(admin_membership)

            # Additional members
            for m in c_data["members"]:
                db.add(CommunityMember(
                    community_id=comm.id,
                    student_id=m.id,
                    role="member"
                ))

            db.commit()
            created_communities[comm.name] = comm

        print(f"✅ Created {len(created_communities)} communities with active memberships.")

        print("🏆 Seeding workshops & hackathons...")
        opportunities_data = [
            {
                "title": "UrbanPulse Smart City Hackathon 2026",
                "description": "A 48-hour student hackathon building innovative solutions for campus sustainability, transport, and IoT connectivity. $5,000 in prizes.",
                "opportunity_type": "Hackathon",
                "organization": "UrbanPulse Developer Chapter",
                "location": "Innovation Hub, Main Auditorium",
                "is_online": False,
                "tags": ["Hackathons", "Smart Cities", "Python", "FastAPI", "Sensors"],
                "event_date": datetime.now() + timedelta(days=21),
                "application_deadline": datetime.now() + timedelta(days=14),
                "registration_link": "https://urbanpulse.college.edu/hackathon-2026",
                "created_by_student_id": created_students["Maya Lin"].id
            },
            {
                "title": "Hands-On Deep Learning with PyTorch Workshop",
                "description": "Interactive 4-hour workshop covering convolutional neural networks, transformer basics, and deployment with FastAPI.",
                "opportunity_type": "Workshop",
                "organization": "AI & Mobility Lab",
                "location": "Virtual / Zoom",
                "is_online": True,
                "tags": ["Artificial Intelligence", "PyTorch", "Python", "Deep Learning"],
                "event_date": datetime.now() + timedelta(days=7),
                "application_deadline": datetime.now() + timedelta(days=5),
                "registration_link": "https://urbanpulse.college.edu/workshops/pytorch-2026",
                "created_by_student_id": created_students["Maya Lin"].id
            },
            {
                "title": "Designing Scalable APIs with FastAPI & Docker",
                "description": "Tech talk and live coding on asynchronous programming, Pydantic validation, and containerizing microservices.",
                "opportunity_type": "Tech Talk",
                "organization": "UrbanPulse Full-Stack Club",
                "location": "Engineering Hall 204 & YouTube Live",
                "is_online": True,
                "tags": ["FastAPI", "Python", "Docker", "Web Development"],
                "event_date": datetime.now() + timedelta(days=10),
                "application_deadline": datetime.now() + timedelta(days=9),
                "registration_link": "https://urbanpulse.college.edu/talks/fastapi-docker",
                "created_by_student_id": created_students["Priya Sharma"].id
            }
        ]

        for o_data in opportunities_data:
            opp = Opportunity(**o_data)
            db.add(opp)
            db.commit()
            db.refresh(opp)

            # Bookmark first opportunity for Maya and Liam
            if "Hackathon" in opp.title:
                db.add(OpportunityBookmark(opportunity_id=opp.id, student_id=created_students["Maya Lin"].id))
                db.add(OpportunityBookmark(opportunity_id=opp.id, student_id=created_students["Liam Scott"].id))
                db.commit()

        print("✅ Created 3 opportunities and bookmarks.")
        print("\n✨ Database seeding completed successfully!")
        print("💡 You can now launch the app with: uvicorn app.main:app --reload")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

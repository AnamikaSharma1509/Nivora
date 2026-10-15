import os
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserPreference
from app.models.productivity import Goal, Task, DailyPlan
from app.models.story import Avatar, Series, Episode, Scene
from app.core.security import get_password_hash

CHARACTERS_DATA = [
    # Indian Characters
    {
        "name": "Meera",
        "display_name": "Meera Sharma",
        "archetype": "AI Systems Engineer",
        "career": "AI Engineer",
        "category": "Technology and AI",
        "nationality": "Indian",
        "preferred_language": "English & Hindi",
        "age_range": "26-32",
        "description": "A brilliant deep-learning systems architect preparing to lead a foundation model deployment team while navigating corporate dynamics.",
        "personality_traits": ["Curious", "Collaborative", "Resilient", "Detail-Oriented"],
        "strengths": ["Neural network architecture", "System debugging", "Cross-team communication"],
        "weaknesses": ["Perfectionism", "Over-committing to research rabbit holes"],
        "motivations": ["Pioneering ethical AI systems", "Empowering open-source engineering talent"],
        "visual_prompt_attributes": "Young Indian woman software engineer, modern Bangalore tech office, smart casual blazer, code terminals in background",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/meera.png",
        "genre_preferences": ["Technology Drama", "Inspirational"],
    },
    {
        "name": "Aarav",
        "display_name": "Aarav Kapoor",
        "archetype": "Fintech Entrepreneur",
        "career": "Startup Founder",
        "category": "Business and entrepreneurship",
        "nationality": "Indian",
        "preferred_language": "English & Hindi",
        "age_range": "28-35",
        "description": "An ambitious Indian startup founder building the next-generation micro-lending and credit rails for emerging market merchants.",
        "personality_traits": ["Visionary", "Energetic", "Charismatic", "Adaptable"],
        "strengths": ["Investor pitching", "Product intuition", "High stress tolerance"],
        "weaknesses": ["Impatience", "Delegation hesitation"],
        "motivations": ["Democratizing financial mobility across Tier 2 and Tier 3 cities"],
        "visual_prompt_attributes": "Charismatic Indian founder, modern Mumbai high-rise glass boardroom, smart linen shirt, financial dashboards",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/aarav.png",
        "genre_preferences": ["Business Drama", "Workplace Drama"],
    },
    {
        "name": "Ananya",
        "display_name": "Dr. Ananya Sen",
        "archetype": "Medical Resident",
        "career": "Medical Student / Resident",
        "category": "Medicine and healthcare",
        "nationality": "Indian",
        "preferred_language": "English & Bengali",
        "age_range": "24-30",
        "description": "A dedicated surgical resident balancing relentless hospital rotations, high-stakes medical examinations, and personal life.",
        "personality_traits": ["Empathetic", "Disciplined", "Calm Under Pressure", "Reflective"],
        "strengths": ["Clinical diagnosis", "Surgical precision", "Patient empathy"],
        "weaknesses": ["Sleep deprivation", "Reluctance to ask for emotional support"],
        "motivations": ["Expanding accessible specialized surgical care to rural districts"],
        "visual_prompt_attributes": "Young Indian female doctor in surgical scrubs with stethoscope, modern hospital hallway, warm cinematic lighting",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/ananya.png",
        "genre_preferences": ["Slice of Life", "Drama"],
    },
    {
        "name": "Riya",
        "display_name": "Riya Varma",
        "archetype": "Lead Product Designer",
        "career": "Creative Professional & Designer",
        "category": "Arts and entertainment",
        "nationality": "Indian",
        "preferred_language": "English",
        "age_range": "25-32",
        "description": "An expressive creative director and product designer crafting bold visual identities for disruptive AI tools.",
        "personality_traits": ["Imaginative", "Expressive", "Socially Aware", "Playful"],
        "strengths": ["Visual storytelling", "Typography mastery", "Intuitive user empathy"],
        "weaknesses": ["Procrastination on spreadsheet budgets", "Overthinking color palettes"],
        "motivations": ["Creating beautiful, humane digital tools that inspire awe"],
        "visual_prompt_attributes": "Stylish Indian creative designer, loft art studio with mood boards, tablets, warm ambient studio lighting",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/riya.png",
        "genre_preferences": ["Romantic Comedy", "Creative Drama"],
    },
    {
        "name": "Arjun",
        "display_name": "Arjun Rathore",
        "archetype": "Decathlete & Sports Scientist",
        "career": "Aspiring Athlete",
        "category": "Sports and fitness",
        "nationality": "Indian",
        "preferred_language": "English & Hindi",
        "age_range": "22-28",
        "description": "A relentless track-and-field decathlete training for national qualification trials while tracking precision biomechanics.",
        "personality_traits": ["Competitive", "Disciplined", "Stoic", "Focused"],
        "strengths": ["Endurance thresholds", "Recovery discipline", "Mental toughness"],
        "weaknesses": ["Over-training risk", "Rest day guilt"],
        "motivations": ["Bringing home an international medal and inspiring grassroots athletics"],
        "visual_prompt_attributes": "Athletic Indian male sprinter on red running track at dawn, athletic sportswear, intense focused expression",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/arjun.png",
        "genre_preferences": ["Sports Drama", "Action Adventure"],
    },
    {
        "name": "Kabir",
        "display_name": "Kabir Mehta",
        "archetype": "Indie Filmmaker",
        "career": "Filmmaker & Director",
        "category": "Arts and entertainment",
        "nationality": "Indian",
        "preferred_language": "English & Hindi",
        "age_range": "27-34",
        "description": "An independent director shooting a gritty, authentic debut feature film across historic and contemporary urban landscapes.",
        "personality_traits": ["Creative", "Intense", "Observant", "Storyteller"],
        "strengths": ["Cinematography eye", "Actor directing", "Atmospheric pacing"],
        "weaknesses": ["Financing anxieties", "Relentless script revisions"],
        "motivations": ["Honest Indian cinematic storytelling without commercial clichés"],
        "visual_prompt_attributes": "Young Indian filmmaker holding a viewfinder monitor on a moody nighttime city set, vintage leather jacket",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/kabir.png",
        "genre_preferences": ["Thriller", "Drama"],
    },
    {
        "name": "Priya",
        "display_name": "Priya Nambiar",
        "archetype": "VP Corporate Strategy",
        "career": "Corporate Professional",
        "category": "Corporate careers",
        "nationality": "Indian",
        "preferred_language": "English & Malayalam",
        "age_range": "32-40",
        "description": "A sharp executive orchestrating international mergers, digital transformation, and sustainable supply-chain policies.",
        "personality_traits": ["Strategic", "Poised", "Diplomatic", "Analytical"],
        "strengths": ["Contract negotiation", "Organizational design", "Executive presence"],
        "weaknesses": ["Guilt over work-life trade-offs"],
        "motivations": ["Becoming the youngest female board director in enterprise tech"],
        "visual_prompt_attributes": "Elegant Indian woman executive in modern tailored suit, Gurgaon skyscraper office overlooking cityscape",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/priya.png",
        "genre_preferences": ["Workplace Drama", "Corporate Drama"],
    },
    {
        "name": "Dev",
        "display_name": "Dev Chatterjee",
        "archetype": "Quantum Computing Researcher",
        "career": "Researcher & Physicist",
        "category": "Science and research",
        "nationality": "Indian",
        "preferred_language": "English & Bengali",
        "age_range": "26-33",
        "description": "A theoretical physicist developing topological qubits and cryogenic quantum circuits in an international research consortium.",
        "personality_traits": ["Analytical", "Introverted", "Patient", "Methodical"],
        "strengths": ["Advanced mathematical modeling", "Quantum algorithms"],
        "weaknesses": ["Explaining research simply to non-technical stakeholders"],
        "motivations": ["Proving quantum supremacy for molecular drug simulations"],
        "visual_prompt_attributes": "Indian researcher in high-tech laboratory standing next to a golden quantum chandelier cryostat",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/dev.png",
        "genre_preferences": ["Science Fiction", "Drama"],
    },
    {
        "name": "Neha",
        "display_name": "Neha Joshi",
        "archetype": "Civil Services Aspirant",
        "career": "Public Service Candidate",
        "category": "Law and public service",
        "nationality": "Indian",
        "preferred_language": "English & Marathi",
        "age_range": "23-28",
        "description": "A focused scholar preparing for the prestigious national civil services examination with a strict 12-hour daily study protocol.",
        "personality_traits": ["Disciplined", "Principled", "Resilient", "Purpose-Driven"],
        "strengths": ["Policy comprehension", "Essay composition", "Ethical reasoning"],
        "weaknesses": ["Burnout risk", "Isolation during preparation"],
        "motivations": ["Serving rural development and education governance with integrity"],
        "visual_prompt_attributes": "Indian woman student sitting at a wooden study desk filled with constitution law books and national maps",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/neha.png",
        "genre_preferences": ["Inspirational", "Drama"],
    },
    {
        "name": "Siddharth",
        "display_name": "Siddharth Patel",
        "archetype": "Robotics Founder",
        "career": "Robotics Engineer",
        "category": "Technology and AI",
        "nationality": "Indian",
        "preferred_language": "English & Gujarati",
        "age_range": "27-34",
        "description": "An autonomous robotics engineer building solar-powered agricultural drones for smallholder farmers.",
        "personality_traits": ["Practical", "Inventive", "Tenacious", "Optimistic"],
        "strengths": ["Hardware-software integration", "Field prototyping", "Direct customer empathy"],
        "weaknesses": ["Underestimating hardware supply chain lead times"],
        "motivations": ["Automating labor-intensive farm tasks to boost crop yields"],
        "visual_prompt_attributes": "Young Indian engineer holding a carbon-fiber drone in a hardware workshop with 3D printers and circuit boards",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/siddharth.png",
        "genre_preferences": ["Technology Drama", "Slice of Life"],
    },
    
    # International Characters
    {
        "name": "Cary",
        "display_name": "Cary Vance",
        "archetype": "Startup Founder & CEO",
        "career": "Startup Founder & CEO",
        "category": "Business and entrepreneurship",
        "nationality": "International",
        "preferred_language": "English",
        "age_range": "28-36",
        "description": "A driven Silicon Valley tech founder steering a high-growth AI infrastructure startup through quarterly deadlines, venture pitches, and keynotes.",
        "personality_traits": ["Ambitious", "Analytical", "Resilient", "Strategic"],
        "strengths": ["Executive decision-making", "Fundraising narrative", "Market velocity"],
        "weaknesses": ["High self-criticism", "Difficulty switching off at night"],
        "motivations": ["Building a generational software company that empowers creators worldwide"],
        "visual_prompt_attributes": "Confident professional woman founder, sharp navy tailored blazer, modern open-plan tech office, presentation displays",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/cary.png",
        "genre_preferences": ["Corporate Drama", "Motivational Storytelling"],
    },
    {
        "name": "Maya",
        "display_name": "Maya Lindqvist",
        "archetype": "Creative Director",
        "career": "Creative Director",
        "category": "Creative professions",
        "nationality": "International",
        "preferred_language": "English & Swedish",
        "age_range": "30-38",
        "description": "A visionary creative director in Stockholm heading sustainable architecture and Scandinavian product experiences.",
        "personality_traits": ["Reflective", "Minimalist", "Perceptive", "Calm"],
        "strengths": ["Harmonious spatial design", "Brand identity", "Team mentorship"],
        "weaknesses": ["Aversion to aggressive commercial timelines"],
        "motivations": ["Designing living spaces that harmonize ecological sustainability with modern beauty"],
        "visual_prompt_attributes": "Scandinavian woman designer, minimalist architectural studio with light birch wood and green plants, soft daylight",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/maya.png",
        "genre_preferences": ["Slice of Life", "Drama"],
    },
    {
        "name": "Alex",
        "display_name": "Alex Chen",
        "archetype": "Autonomous Systems Architect",
        "career": "Autonomous Robotics Engineer",
        "category": "Technology and AI",
        "nationality": "International",
        "preferred_language": "English & Mandarin",
        "age_range": "26-33",
        "description": "A pioneering systems architect in San Francisco developing real-time perception for humanoid robotics.",
        "personality_traits": ["Analytical", "Adventurous", "Disciplined", "Curious"],
        "strengths": ["Sensor fusion", "Edge compute optimization", "Mathematical rigor"],
        "weaknesses": ["Impatience with legacy bureaucratic testing protocols"],
        "motivations": ["Building robotic companions that assist elderly mobility"],
        "visual_prompt_attributes": "Young Asian engineer calibrating a sleek bipedal robot chassis in an advanced robotics facility",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/alex.png",
        "genre_preferences": ["Science Fiction", "Technology Drama"],
    },
    {
        "name": "Jordan",
        "display_name": "Dr. Jordan Hayes",
        "archetype": "Astrophysics Researcher",
        "career": "Research Scientist",
        "category": "Science and research",
        "nationality": "International",
        "preferred_language": "English",
        "age_range": "29-37",
        "description": "An astrophysicist analyzing exoplanet atmospheric signatures from orbital space telescopes.",
        "personality_traits": ["Curious", "Patient", "Deep Thinker", "Methodical"],
        "strengths": ["Spectroscopy analysis", "Cosmological simulation", "Data synthesis"],
        "weaknesses": ["Losing track of terrestrial schedules during observation windows"],
        "motivations": ["Confirming the first bio-signature atmospheric indicators beyond our solar system"],
        "visual_prompt_attributes": "Scientist at an astronomical observatory dome at night, massive telescope and galaxy projection screens",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/jordan.png",
        "genre_preferences": ["Science Fiction", "Inspirational"],
    },
    {
        "name": "Daniel",
        "display_name": "Daniel Silva",
        "archetype": "Endurance Athlete",
        "career": "Triathlete",
        "category": "Sports and fitness",
        "nationality": "International",
        "preferred_language": "English & Portuguese",
        "age_range": "25-32",
        "description": "A professional iron-distance triathlete pushing aerobic limits while mastering heart-rate variability and nutrition science.",
        "personality_traits": ["Resilient", "Laser-Focused", "Optimistic", "Tenacious"],
        "strengths": ["Endurance pacing", "Mental grit during pain barriers", "Dietary discipline"],
        "weaknesses": ["Difficulty resting when injured"],
        "motivations": ["Qualifying for the world championship podium in Kona"],
        "visual_prompt_attributes": "Athletic triathlete cycling a carbon aerodynamic road bike on a coastal highway at sunrise",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/daniel.png",
        "genre_preferences": ["Sports Drama", "Action Adventure"],
    },
    {
        "name": "Elena",
        "display_name": "Dr. Elena Rostova",
        "archetype": "Biotech Founder",
        "career": "Biomedical Scientist",
        "category": "Medicine and healthcare",
        "nationality": "International",
        "preferred_language": "English & Russian",
        "age_range": "31-39",
        "description": "A cellular biologist translating targeted mRNA delivery therapies from lab bench to clinical human trials.",
        "personality_traits": ["Courageous", "Analytical", "Inspiring", "Pragmatic"],
        "strengths": ["Translational oncology", "Regulatory defense", "Venture negotiation"],
        "weaknesses": ["High emotional toll when clinical trials hit friction"],
        "motivations": ["Eradicating hereditary neurodegenerative conditions"],
        "visual_prompt_attributes": "Distinguished woman scientist looking at illuminated gene-sequencing screens in a sterile cleanroom biotech lab",
        "visual_style": "Cinematic Photorealistic",
        "image_url": "/avatars/elena.png",
        "genre_preferences": ["Technology Drama", "Drama"],
    }
]

def seed_nivora_database():
    db: Session = SessionLocal()
    try:
        print("--- Seeding Nivora 2.0 Database ---")
        
        # 1. Seed Character Library Avatars
        avatar_map = {}
        for cdata in CHARACTERS_DATA:
            existing = db.query(Avatar).filter(Avatar.name == cdata["name"], Avatar.is_template == True).first()
            if not existing:
                av = Avatar(
                    name=cdata["name"],
                    display_name=cdata.get("display_name", cdata["name"]),
                    archetype=cdata["archetype"],
                    career=cdata.get("career", cdata["archetype"]),
                    category=cdata.get("category", "Technology and AI"),
                    nationality=cdata.get("nationality", "International"),
                    preferred_language=cdata.get("preferred_language", "English"),
                    age_range=cdata.get("age_range", "25-35"),
                    description=cdata["description"],
                    personality_traits=cdata.get("personality_traits", []),
                    strengths=cdata.get("strengths", []),
                    weaknesses=cdata.get("weaknesses", []),
                    motivations=cdata.get("motivations", []),
                    visual_prompt_attributes=cdata["visual_prompt_attributes"],
                    visual_style=cdata.get("visual_style", "Cinematic Photorealistic"),
                    image_url=cdata.get("image_url"),
                    genre_preferences=cdata.get("genre_preferences", []),
                    story_preferences={"tone": "cinematic", "pacing": "balanced"},
                    is_template=True,
                    is_custom=False
                )
                db.add(av)
                db.flush()
                avatar_map[cdata["name"].lower()] = av
                print(f"Added avatar template: {av.name} ({av.category})")
            else:
                # Update attributes if needed
                existing.category = cdata.get("category", existing.category)
                existing.nationality = cdata.get("nationality", existing.nationality)
                existing.strengths = cdata.get("strengths", existing.strengths)
                existing.weaknesses = cdata.get("weaknesses", existing.weaknesses)
                avatar_map[cdata["name"].lower()] = existing

        db.commit()

        # 2. Ensure Investor Demo User exists
        demo_user = db.query(User).filter(User.email == "demo@nivora.ai").first()
        if not demo_user:
            demo_user = User(
                email="demo@nivora.ai",
                hashed_password=get_password_hash("nivora2026demo!"),
                display_name="Cary Vance",
                is_active=True,
                is_verified=True,
                level=3,
                xp=650,
                current_streak=5,
                longest_streak=5,
            )
            db.add(demo_user)
            db.flush()
            pref = UserPreference(
                user_id=demo_user.id,
                time_zone="America/Los_Angeles",
                language="en",
                preferred_tone="motivational",
                caption_enabled=True,
                background_music_enabled=True
            )
            db.add(pref)
            db.commit()
            print("Created demo user: demo@nivora.ai")

        # 3. Create Demo Series for Cary if not present
        cary_avatar = avatar_map.get("cary") or db.query(Avatar).filter(Avatar.name == "Cary").first()
        demo_series = db.query(Series).filter(Series.user_id == demo_user.id).first()
        if not demo_series and cary_avatar:
            demo_series = Series(
                user_id=demo_user.id,
                avatar_id=cary_avatar.id,
                title="The Scaling Horizon: Season 1",
                genre="Corporate Drama",
                long_term_purpose="Close the Series A financing and ship the autonomous intelligence platform.",
                current_season=1,
                current_episode_number=10,
                status="active"
            )
            db.add(demo_series)
            db.commit()
            print("Created Cary demo series.")

        # 4. Seed the 6 Demo Characters and their 60 Distinct Sample Episodes (5 days × 2 eps)
        demo_chars = ["cary", "meera", "aarav", "ananya", "riya", "arjun"]
        
        episode_templates = {
            "cary": [
                # Day 1
                (1, "A", "The Quarter-End Deadline", 
                 "Cary faces a high-stakes morning finalizing quarterly revenue numbers and delivering the reports directly to the board.",
                 "The sun hasn't crested the skyline when Cary's tablet lights up with final revenue variances.",
                 "A confidential envelope lands on Cary's desk stamped with the mark of a top-tier venture firm.",
                 "SCENE 1: Modern glass office at dawn. Cary reviews financial metrics on a sleek dual-monitor terminal. Narration highlights the ticking clock before the quarterly executive review. SCENE 2: The documents verify completed forecasts. Cary walks into the boardroom, handing the audited report to the executive director who nods with approval. SCENE 3: In the conference auditorium, Cary delivers the keynote address to applause. Later, an unexpected private invitation arrives from a tier-1 investor."),
                (1, "B", "Keynote Under Pressure",
                 "Cary delivers an electric five-minute address to incoming engineers and receives an invitation to a private investor summit.",
                 "The auditorium lights hum as Cary stands center stage before hundreds of industry eyes.",
                 "The summit invitation holds one condition: Cary must present the architectural demo by midnight.",
                 "SCENE 1: Backstage greenroom. Cary adjusts notes while the audience fills the hall. SCENE 2: Spotlight hits the stage. Cary speaks with fierce clarity about autonomous productivity systems. SCENE 3: Stepping offstage, a partner from a sovereign fund requests an exclusive private briefing."),
                # Day 2
                (2, "A", "The Term Sheet Challenge",
                 "A surprise clause in the proposed term sheet threatens founder governance, demanding an immediate strategic pivot.",
                 "The redline draft arrived at 6 AM, and paragraph four changes everything.",
                 "The lead partner gives Cary until sundown to accept the revised board seat structure.",
                 "SCENE 1: War room whiteboard. Cary dissects ownership percentages with legal counsel. SCENE 2: Counter-proposals are formulated with surgical precision. SCENE 3: A tense conference call concludes with mutual respect established."),
                (2, "B", "The Architecture Lock",
                 "Cary conducts a grueling technical review with lead engineers to ensure 99.99% reliability ahead of the demo.",
                 "Servers spike in latency just hours before the investor partner walkthrough.",
                 "The cluster stabilizes, but a single critical test suite throws an intermittent edge-case error.",
                 "SCENE 1: Engineering pit. Cary gathers the core developers around the main telemetry screen. SCENE 2: Real-time query traces illuminate the bottleneck. SCENE 3: Code patches deploy cleanly; latency drops to single-digit milliseconds."),
                # Day 3
                (3, "A", "Black Swan Breakdown",
                 "Severe operational disruption hits production infrastructure, forcing Cary to miss routine checkpoints and manage an incident.",
                 "Monitors illuminate red across three availability zones simultaneously.",
                 "Cary halts external meetings to take command of root-cause disaster mitigation.",
                 "SCENE 1: Emergency bridge line. Cary coordinates traffic re-routing across secondary data centers. SCENE 2: Public communications drafted transparently. SCENE 3: The storm passes, but the scheduled daily milestones have been impacted."),
                (3, "B", "Resilience Under Fire",
                 "Emerging from the incident, Cary initiates continuity recovery protocols and rallies the leadership team.",
                 "The aftermath of the outage leaves the war room exhausted but unbroken.",
                 "A competitor attempts to capitalize on the downtime, but client loyalty holds firm.",
                 "SCENE 1: Evening debrief with senior leadership. Cary outlines the post-mortem safeguards. SCENE 2: Key enterprise customers receive personal assurances. SCENE 3: The team recommits with renewed focus for tomorrow's recovery sprint."),
                # Day 4
                (4, "A", "The Turnaround Sprint",
                 "Returning after the disruption, Cary executes a double-speed backlog sprint to reclaim lost momentum.",
                 "Daybreak brings a clean slate and a doubled resolve to clear every delayed item.",
                 "The backlog burns down 40% faster than projected.",
                 "SCENE 1: Focused deep-work session. Cary clears overdue client briefs and financial re-forecasts. SCENE 2: All partner deliverables submitted ahead of lunch. SCENE 3: Client champions send congratulatory endorsements."),
                (4, "B", "The Sovereign Alliance",
                 "An unexpected institutional delegation visits headquarters for a live demonstration of the core AI models.",
                 "Black town cars pull up to the campus entrance as the team prepares the demonstration terminal.",
                 "The committee chairman requests a live stress test on their private corporate data.",
                 "SCENE 1: Private briefing salon. Cary walks through real-world deployment telemetry. SCENE 2: Live stress test executes without a single error. SCENE 3: The delegation confirms readiness to move to final contracting."),
                # Day 5
                (5, "A", "The Final Milestone",
                 "The culmination of the 5-day cycle arrives as the enterprise contract agreements are finalized.",
                 "Pen meets paper in the legal department as five days of discipline bear fruit.",
                 "The closing signature clears the path for the multi-million dollar flagship partnership.",
                 "SCENE 1: High-floor signing room overlooking the bay. Cary reviews the execution signatures. SCENE 2: Mutual handshakes seal the premier pilot program. SCENE 3: The whole office receives word of the victory."),
                (5, "B", "A New Horizon (Season 1 Finale)",
                 "Cary addresses the entire company at the milestone townhall, reflecting on resilience and setting the vision for Season 2.",
                 "Champagne flutes clink as the team celebrates an extraordinary 5-day comeback.",
                 "As the celebration winds down, Cary receives an unlisted phone call regarding global expansion.",
                 "SCENE 1: Townhall auditorium. Cary thanks every team member who persevered through the week's trials. SCENE 2: Visual montage recaps the five days of triumphs and recoveries. SCENE 3: Cliffhanger ending: the phone screen displays an international country code from Tokyo.")
            ],
            "meera": [
                (1, "A", "First Epoch: The Model Awakening", "Meera boots up a 100-billion parameter transformer cluster for the first time.", "The cooling fans scream as telemetry lights turn green.", "A bizarre loss plateau threatens the training run.", "SCENE: Bangalore lab, Meera analyzes loss curves and implements gradient checkpointing."),
                (1, "B", "The Benchmark Showdown", "Meera compares model inference latency against industry leaders.", "Inference times match targets within 2 milliseconds.", "A surprise edge case emerges in multilingual reasoning.", "SCENE: Tech review room, Meera defends the benchmark results to the VP of Engineering."),
                (2, "A", "Distributed Consensus", "Debugging an asynchronous communication stall across 64 GPUs.", "The cluster hangs at epoch 42 without an error log.", "Meera isolates a race condition in the custom NCCL kernel.", "SCENE: Meera traces GPU memory buffers until dawn."),
                (2, "B", "The Open Source Pitch", "Meera convinces leadership to release the optimization library as open-source.", "The open-source proposal meets skepticism from monetization leads.", "A compromise allows dual-licensing with community enthusiasm.", "SCENE: Boardroom debate on open innovation."),
                (3, "A", "Training Interrupted", "A cloud provider maintenance window halts training during a critical deadline.", "Data sync fails mid-checkpoint.", "Meera battles to restore corrupted tensor weights.", "SCENE: Emergency data restoration under time pressure."),
                (3, "B", "The Clean Checkpoint", "Meera successfully recovers the weights and designs an automated parity test.", "Parity tests pass 100%.", "An international AI conference accepts Meera's paper.", "SCENE: Meera smiles as the terminal prints 'Validation complete'."),
                (4, "A", "Paper Defense", "Meera presents her distributed training breakthrough to global researchers.", "Tough questions arise regarding energy consumption.", "Meera proves a 40% reduction in carbon footprint.", "SCENE: Virtual conference presentation with live Q&A."),
                (4, "B", "Team Elevation", "Meera is officially promoted to lead the Foundation Systems group.", "A bouquet and team applause welcome Meera to the executive floor.", "Her first assignment: deploy into 10 million smartphones.", "SCENE: Handshakes and celebration in Bangalore campus."),
                (5, "A", "The Mobile Quantization Sprint", "Compressing the 70B parameter model down to 4-bit integer weights for mobile chips.", "Quantization introduces accuracy drop on medical vocabularies.", "Meera crafts a novel selective quantization matrix.", "SCENE: Lab testing on prototype hardware."),
                (5, "B", "In Every Pocket (Season 1 Finale)", "The model goes live to millions of users worldwide with zero perceptible lag.", "Global app stores feature the new smart assistant.", "Meera looks out over Bangalore's night skyline, ready for the next breakthrough.", "SCENE: Cinematic drone shot of Bangalore tech corridor as the launch counter hits zero.")
            ],
            "aarav": [
                (1, "A", "The Merchant Rail", "Aarav pitches instant cross-border settlements to Mumbai trade associations.", "Traditional bankers question the need for blockchain-backed rails.", "A tier-1 retail chain agrees to a pilot.", "SCENE: Nariman Point conference room, lively financial debate."),
                (1, "B", "The Pilot Launch", "Deploying the first 500 payment terminals to local shop owners.", "Shopkeepers celebrate zero transaction fees.", "A regulatory notice arrives requesting compliance disclosures.", "SCENE: Vibrant Colaba marketplace with merchant interviews."),
                (2, "A", "Regulatory Chess", "Aarav meets central bank regulators to demonstrate anti-fraud compliance.", "The committee scrutinizes high-volume stress tests.", "Aarav's real-time risk engine earns praise.", "SCENE: Stately government office with reserve bank officials."),
                (2, "B", "The Growth Surge", "Transaction volume spikes 400% as merchants embrace instant UPI-to-SEPA transfers.", "Servers strain under Saturday bazaar volume.", "The gateway executes 50,000 transactions without a glitch.", "SCENE: Operations center monitoring glowing transaction heatmaps."),
                (3, "A", "Cashflow Squeeze", "A bank settlement partner delays liquidity disbursement by 48 hours.", "Merchant balances must be honored before midnight.", "Aarav seeks bridge capital on zero notice.", "SCENE: Tense late-night negotiations in a Mumbai cafe."),
                (3, "B", "The Trust Dividend", "Aarav taps angel syndicates to backstop all merchant payouts personally.", "Merchants receive every rupee on time.", "Word-of-mouth spreads Aarav's reputation for unwavering honesty.", "SCENE: Aarav addresses an anxious merchant association with calm authority."),
                (4, "A", "The Sovereign Term Sheet", "A Singaporean sovereign wealth fund proposes a Series A lead investment.", "Valuation exceeds expectations, but board composition is debated.", "Aarav negotiates Indian founder super-voting rights.", "SCENE: High-rise Marina Bay video call."),
                (4, "B", "Signing the Future", "Series A documents are executed with full founder autonomy preserved.", "Team cheers in the Bandra co-working hub.", "A major Dubai logistics conglomerate requests immediate integration.", "SCENE: Rooftop team celebration with city lights below."),
                (5, "A", "The Cross-Border Corridor", "Launching the Dubai-Mumbai remittance pipeline with sub-second finality.", "Traditional 3-day wait times disappear instantly.", "Over $10 million flows through the corridor on Day 1.", "SCENE: Live ticker ticking upwards in millions."),
                (5, "B", "Fintech Titan (Season 1 Finale)", "Aarav speaks at the Global Fintech Conclave, announcing pan-Asian expansion.", "Standing ovation from the financial ecosystem.", "A secret partnership offer from a Swiss private bank arrives.", "SCENE: Grand ballroom stage, Aarav receiving Entrepreneur of the Year.")
            ],
            "ananya": [
                (1, "A", "Grand Rounds", "Dr. Ananya enters the surgical theater for her first complex vascular procedure.", "Surgeon in chief tests Ananya on anatomy under pressure.", "Ananya spots a rare arterial anomaly in time.", "SCENE: Sterile OT lights, heart monitor beeping steadily."),
                (1, "B", "The Diagnostic Riddle", "A pediatric patient presents with an elusive multi-system autoimmune condition.", "Standard panels come back inconclusive.", "Ananya researches medical journals until she identifies the rare syndrome.", "SCENE: Hospital library at midnight, microscope and reference texts."),
                (2, "A", "On-Call Night", "A monsoon storm brings a surge of trauma emergencies to the city casualty ward.", "ER beds fill to maximum capacity.", "Ananya triages thirty cases with calm compassion.", "SCENE: Raining heavily outside ER bay as ambulances arrive."),
                (2, "B", "The Critical Decision", "Ananya makes a split-second airway intervention that saves an elderly patient's life.", "Vital signs stabilize as family weeps with gratitude.", "The chief of surgery recognizes Ananya's clinical poise.", "SCENE: Quiet ICU bedside as morning dawn breaks."),
                (3, "A", "The Exam Wall", "Exhaustion collides with final surgical board examination preparations.", "Ananya misses a study session due to an emergency shift.", "Stress tests her resolve to continue.", "SCENE: Small resident dorm room with anatomical flashcards."),
                (3, "B", "The Resident Pact", "Fellow residents rally to share case notes and organize mock viva reviews.", "Group solidarity lifts morale.", "Ananya masters the most challenging surgical oncology topics.", "SCENE: Hospital cafeteria table covered in tea cups and textbooks."),
                (4, "A", "Board Examination Day", "Ananya sits for the grueling eight-hour fellowship surgical examination.", "Complex clinical scenarios test ethical and procedural knowledge.", "Ananya articulates her diagnostic rationale with complete confidence.", "SCENE: Solemn examination hall with medical examiners."),
                (4, "B", "The Gold Medal", "Results are posted: Dr. Ananya achieves top marks in the state surgical registry.", "The department head pins the honors ribbon to her white coat.", "A prestigious pediatric cardiology fellowship offer arrives.", "SCENE: Hospital auditorium award ceremony."),
                (5, "A", "The Rural Clinic Initiative", "Ananya travels to a remote health center to perform life-changing surgeries.", "Dozens of rural families gather for cleft and hernia repairs.", "Six successful surgeries completed in a single dedicated day.", "SCENE: Sunlight streaming through rural clinic windows, grateful smiles."),
                (5, "B", "The Healer's Oath (Season 1 Finale)", "Ananya reflects on the journey from student to surgeon, recommitting to compassionate care.", "Her mentor hands her the department scalpel of honor.", "Tomorrow's rotation brings her first case as lead surgeon.", "SCENE: Sunset on the hospital roof terrace, stethoscope in hand.")
            ],
            "riya": [
                (1, "A", "The Blank Canvas", "Riya is tasked with designing the global visual identity for an AI design studio.", "First client brief calls for 'humanistic future minimalism'.", "Riya sketches thirty distinct monogram explorations.", "SCENE: Creative studio in Hauz Khas, sketchpads, pantone swatches."),
                (1, "B", "The Client Pitch", "Riya presents the bold brand architecture to the executive design board.", "The client loves the typography but requests warmer emotional resonance.", "Riya adapts the color hierarchy live during the pitch.", "SCENE: Screen sharing vibrant interactive design prototypes."),
                (2, "A", "Interactive Design Sprint", "Building micro-animations and spatial sound design for the new application.", "Figma files hit complex component variants.", "Every button hover feels tactile and premium.", "SCENE: Dual monitors with motion curves and micro-interaction states."),
                (2, "B", "The Aesthetic Breakthrough", "Riya pioneers a dark glassmorphic interface with warm gradient accents.", "Beta testers praise the interface as 'the most beautiful tool in tech'.", "A renowned European design biennial invites Riya to exhibit.", "SCENE: Studio team testing the mobile build on various devices."),
                (3, "A", "Creative Block", "Deadline pressures and client scope-creep drain creative energy.", "Riya struggles to align conflicting stakeholder feedback.", "A scheduled design review must be postponed.", "SCENE: Dimly lit studio with crumpled paper and tea cups."),
                (3, "B", "The Museum Walk", "A walk through the modern art gallery sparks a radical new layout direction.", "Inspired by modern abstract painters, Riya discovers an asymmetrical grid.", "The redesign revitalizes the entire project.", "SCENE: National Gallery of Modern Art, inspiration strikes."),
                (4, "A", "The Re-imagined Interface", "Riya presents the revamped asymmetrical system to universal acclaim.", "Stakeholders drop conflicting demands in favor of Riya's vision.", "Development team begins implementation of design tokens.", "SCENE: Design-engineering sync with smooth handoff."),
                (4, "B", "Design of the Year Nomination", "The project is officially nominated for the International Digital Design Award.", "Feature articles published in major creative design publications.", "Riya is invited as keynote speaker for Tokyo Design Week.", "SCENE: Magazine spreads and social design acclaim."),
                (5, "A", "Worldwide App Launch", "The app launches globally, praised for its cinematic elegance.", "100,000 downloads in the first twenty-four hours.", "Design community hails it as a benchmark for aesthetic software.", "SCENE: App Store feature banner glowing on tablet."),
                (5, "B", "Master Creator (Season 1 Finale)", "Riya inaugurates her independent creative consultancy studio.", "Friends, mentors, and collaborators celebrate the studio launch.", "An invitation arrives from a Parisian luxury fashion house for digital couture.", "SCENE: Studio opening night party with fairy lights and modern art installations.")
            ],
            "arjun": [
                (1, "A", "Dawn Track", "Arjun begins daybreak interval sprints in preparation for decathlon trials.", "Biometric sensors monitor VO2 max and stride frequency.", "Arjun hits a personal record in the 400-meter dash.", "SCENE: Foggy sports stadium track at 5 AM, rhythmic spikes on clay."),
                (1, "B", "The Iron Discipline", "Strength and conditioning session focusing on javelin mechanics.", "Coach adjusts hip rotation for explosive release velocity.", "The javelin pierces past the 75-meter qualifying marker.", "SCENE: Throwing field, chalk dust, coach timing splits."),
                (2, "A", "The High Jump Barrier", "Arjun works to conquer the 2.10-meter high jump psychological hurdle.", "Bar clips on the first two attempts.", "On the third leap, Arjun clears with flawless fosbury flop form.", "SCENE: High jump mat, slow-motion clearance over bar."),
                (2, "B", "Biometric Optimization", "Sports nutritionist and recovery physiotherapist review sleep and lactic acid data.", "Muscle inflammation is minimized with cryotherapy and red-light recovery.", "Arjun is declared in peak athletic readiness.", "SCENE: Modern sports science lab with recovery pods."),
                (3, "A", "Hamstring Scare", "A sharp twinge in the left hamstring forces an abrupt halt during hurdle drills.", "Anxiety mounts over the upcoming trials.", "Physiotherapy protocol initiates immediately.", "SCENE: Medical training room, ultrasound examination of muscle tissue."),
                (3, "B", "The Mental Champion", "Rest day transformed into visualization and mental conditioning mastery.", "Sports psychologist walks Arjun through every decathlon event in the mind's eye.", "Confidence replaces apprehension.", "SCENE: Quiet meditation room overlooking stadium."),
                (4, "A", "National Trials: Day 1", "Arjun enters the stadium for Day 1 of the national decathlon trials.", "100m sprint: 1st place (10.6s). Long jump: 2nd place (7.6m). Shot put: personal best.", "Arjun leads the overall points tally by 120 points.", "SCENE: Roaring stadium crowd, electronic scoreboard updating standings."),
                (4, "B", "Under the Stadium Lights", "Night falls as Day 1 concludes with the grueling 400-meter race.", "Arjun pushes past the pain barrier in the final 100-meter straight.", "Crosses the line first, locking in the Day 1 overall lead.", "SCENE: Arjun catching his breath on the track as spectators cheer."),
                (5, "A", "The 1500m Crucible", "The final and most punishing event of the decathlon arrives.", "Arjun must finish within 4 minutes 20 seconds to shatter the national record.", "Every muscle screams, but the internal drive carries him forward.", "SCENE: Final lap bell rings, dramatic sprint to the finish line."),
                (5, "B", "National Record (Season 1 Finale)", "Arjun crosses the line, collapsing in triumph as the clock reads 4:18.4.", "New national decathlon record established; international championship ticket punched.", "Arjun wraps the national flag around his shoulders in tears of joy.", "SCENE: Podium celebration with national anthem and gold medal presentation.")
            ]
        }

        # Populate the 60 distinct episodes
        total_seeded_episodes = 0
        for char_key in demo_chars:
            ep_list = episode_templates.get(char_key, [])
            for day_num, slot, title, summary, hook, cliff, script in ep_list:
                ep_number = (day_num - 1) * 2 + (1 if slot == "A" else 2)
                
                # Check if this demo episode already exists
                existing_ep = db.query(Episode).filter(
                    Episode.demo_character_key == char_key,
                    Episode.day_number == day_num,
                    Episode.episode_slot == slot
                ).first()

                # Demo video path (real stored file in /demo/... or /media/demo/...)
                video_file_path = f"/demo/{char_key}/day-0{day_num}/episode-{slot.lower()}.mp4"
                thumb_path = f"/thumbnails/{char_key}_day{day_num}_{slot.lower()}.png"

                # Branch previews for 80, 90, 100
                branch_previews = {
                    "branch_80": {
                        "narrative": f"Completing 80% tasks allows {char_key.capitalize()} to keep the baseline steady with an unresolved issue to tackle tomorrow.",
                        "outcome": "Steady Progress with Pending Challenge",
                        "reward": "+50 XP, Standard Streak"
                    },
                    "branch_90": {
                        "narrative": f"Reaching 90% completion earns {char_key.capitalize()} positive recognition and early notice on tomorrow's hurdle.",
                        "outcome": "High Velocity & Partner Approval",
                        "reward": "+80 XP, Accelerated Streak"
                    },
                    "branch_100": {
                        "narrative": f"Flawless 100% completion unlocks {char_key.capitalize()}'s golden narrative milestone and highest tier rewards.",
                        "outcome": "Mastery Achieved & Golden Milestone Unlocked",
                        "reward": "+120 XP, Legendary Streak Multiplier"
                    }
                }

                if not existing_ep:
                    new_ep = Episode(
                        series_id=demo_series.id,
                        user_id=demo_user.id,
                        episode_number=ep_number,
                        day_number=day_num,
                        episode_slot=slot,
                        demo_character_key=char_key,
                        title=title,
                        summary=summary,
                        opening_hook=hook,
                        cliffhanger=cliff,
                        full_script=script,
                        script_json={"narrative": script, "act": 1 if slot == "A" else 2},
                        task_snapshot={"completed": [f"Task for Day {day_num} {slot}"], "missed": []},
                        branch_previews=branch_previews,
                        generation_status="completed",
                        video_url=video_file_path,
                        thumbnail_url=thumb_path,
                        captions_url=f"/demo/{char_key}/day-0{day_num}/captions.vtt",
                        duration_seconds=60.0
                    )
                    db.add(new_ep)
                    db.flush()
                    
                    # Create 3 scenes for this episode
                    for s_num in range(1, 4):
                        sc = Scene(
                            episode_id=new_ep.id,
                            scene_number=s_num,
                            title=f"Scene {s_num}: {title.split(':')[0]}",
                            visual_description=f"Cinematic framing for scene {s_num} showing {char_key.capitalize()} in characteristic environment.",
                            image_prompt=f"Cinematic shot of {char_key.capitalize()}, photorealistic, scene {s_num}",
                            narration_text=f"Scene {s_num} narration highlighting the determination of {char_key.capitalize()}.",
                            dialogue=[{"speaker": char_key.capitalize(), "line": f"We are on track to make history today."}],
                            mood="inspirational",
                            duration_seconds=20.0,
                            image_url=thumb_path
                        )
                        db.add(sc)

                    total_seeded_episodes += 1
                else:
                    # Update existing record
                    existing_ep.title = title
                    existing_ep.summary = summary
                    existing_ep.full_script = script
                    existing_ep.branch_previews = branch_previews
                    existing_ep.video_url = video_file_path

        db.commit()
        print(f"Seeded {total_seeded_episodes} new distinct demo episodes (Target: 60 total episodes across 6 characters).")
        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_nivora_database()

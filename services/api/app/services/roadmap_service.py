from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from app.models.productivity import Goal, Task

class RoadmapService:
    """
    Intelligent roadmap generation engine for Nivora.
    Produces individualized, domain-specific milestone roadmaps based on:
    - User's destination goal
    - Current starting point / situation
    - Target completion date
    - Weekly available pace
    - Completed tasks & verified milestone progress
    """

    @staticmethod
    def _parse_target_date(target_date: Optional[datetime]) -> Optional[datetime]:
        if not target_date:
            return None
        if target_date.tzinfo is None:
            return target_date.replace(tzinfo=timezone.utc)
        return target_date

    @classmethod
    def generate_personalized_roadmap(
        cls,
        goal: Optional[Goal],
        user_tasks: Optional[List[Task]] = None
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)

        if not goal:
            return cls._generate_default_provisional_roadmap(now)

        goal_title = goal.title or "Professional Mastery"
        goal_desc = goal.description or ""
        current_situation = goal.current_situation or "Beginning foundation"
        target_date = cls._parse_target_date(goal.target_date)

        # Calculate time horizon
        if target_date:
            days_remaining = (target_date - now).days
            is_overdue = days_remaining < 0
        else:
            days_remaining = None
            is_overdue = False

        # Identify career domain from goal text
        domain = cls._detect_goal_domain(goal_title, goal_desc, goal.category)
        
        # Build milestones tailored to domain & current situation
        raw_milestones = cls._build_domain_milestones(domain, goal_title, current_situation, target_date, now, days_remaining)

        # Merge with any existing user milestones in goal.milestones
        merged_milestones = cls._merge_existing_milestones(raw_milestones, goal.milestones or [], user_tasks or [])

        # Feasibility assessment
        feasibility = cls._assess_feasibility(domain, days_remaining, len(merged_milestones), is_overdue)

        # Calculate schedule status
        completed_count = sum(1 for m in merged_milestones if m.get("status") == "completed")
        total_count = len(merged_milestones)

        if days_remaining is None:
            schedule_status = "provisional"
        elif is_overdue:
            schedule_status = "overdue"
        else:
            # Expected completed based on time elapsed vs total
            expected_ratio = max(0.0, min(1.0, 1.0 - (days_remaining / 365.0))) if days_remaining <= 365 else 0.2
            actual_ratio = completed_count / total_count if total_count > 0 else 0.0
            if actual_ratio >= expected_ratio - 0.05:
                schedule_status = "on_schedule"
            elif actual_ratio > expected_ratio + 0.15:
                schedule_status = "ahead"
            else:
                schedule_status = "behind"

        return {
            "domain": domain,
            "goal_title": goal_title,
            "current_situation": current_situation,
            "target_date": target_date.strftime("%Y-%m-%d") if target_date else None,
            "days_remaining": days_remaining,
            "is_overdue": is_overdue,
            "schedule_status": schedule_status,
            "feasibility": feasibility,
            "milestones": merged_milestones,
            "summary": {
                "total_milestones": total_count,
                "completed_milestones": completed_count,
                "remaining_milestones": total_count - completed_count,
                "current_milestone": next((m["title"] for m in merged_milestones if m.get("status") != "completed"), "All Milestones Achieved"),
                "next_milestone_deadline": next((m["estimated_completion_date"] for m in merged_milestones if m.get("status") != "completed"), None)
            }
        }

    @classmethod
    def _detect_goal_domain(cls, title: str, desc: str, category: Optional[str]) -> str:
        text = f"{title.lower()} {desc.lower()} {(category or '').lower()}"
        if any(w in text for w in ["ai", "machine learning", "ml", "systems engineer", "deep learning", "neural", "python", "software engineer", "devops"]):
            return "ai_systems_engineer"
        if any(w in text for w in ["fintech", "startup", "founder", "ceo", "entrepreneur", "venture", "payments", "business"]):
            return "fintech_entrepreneur"
        if any(w in text for w in ["medical", "doctor", "resident", "physician", "clinical", "surgery", "healthcare", "pediatric"]):
            return "medical_resident"
        if any(w in text for w in ["designer", "product design", "ux", "ui", "spatial computing", "interaction", "haptic"]):
            return "product_designer"
        if any(w in text for w in ["athlete", "decathlete", "sports", "fitness", "marathon", "endurance", "biomechanics"]):
            return "sports_scientist"
        return "general_mastery"

    @classmethod
    def _build_domain_milestones(
        cls,
        domain: str,
        goal_title: str,
        current_situation: str,
        target_date: Optional[datetime],
        now: datetime,
        days_remaining: Optional[int]
    ) -> List[Dict[str, Any]]:
        # Date offset helper
        def date_at_month(m: int) -> str:
            d = now + timedelta(days=m * 30)
            if target_date and d > target_date:
                d = target_date
            return d.strftime("%Y-%m-%d")

        if domain == "ai_systems_engineer":
            return [
                {
                    "id": "m1",
                    "month_checkpoint": 1,
                    "title": "Systems Programming & Linux Kernel Primitives",
                    "description": "Master core C/Python memory models, POSIX multi-threading, CPU cache hierarchy, and Linux OS performance profiling.",
                    "estimated_completion_date": date_at_month(1),
                    "why_it_matters": "Distributed model inference bottlenecks originate at hardware and operating system boundaries, not pure math.",
                    "required_tasks_or_evidence": "Benchmarked asynchronous I/O loops and profiling memory throughput under concurrent load.",
                    "dependencies": ["Programming fundamentals"],
                    "status": "in_progress",
                    "completion_criteria": "Pass boundary test cases on multi-threaded concurrent pipelines with zero memory leaks.",
                    "suggested_weekly_pace": "8-10 hours/week focused on low-level systems practice.",
                    "weight": 20
                },
                {
                    "id": "m2",
                    "month_checkpoint": 2,
                    "title": "Distributed Systems & Asynchronous Networking",
                    "description": "Design high-throughput gRPC micro-services, raft consensus prototypes, and fault-tolerant streaming pipelines.",
                    "estimated_completion_date": date_at_month(2),
                    "why_it_matters": "Modern LLM inference runs over clusters of machines requiring strict latency budgets and failure handling.",
                    "required_tasks_or_evidence": "Deployed resilient multi-node worker service with automated heartbeat re-election.",
                    "dependencies": ["Systems Programming & Linux Kernel Primitives"],
                    "status": "not_started",
                    "completion_criteria": "Zero dropped packets across 10,000 simulated client connections with failover recovery.",
                    "suggested_weekly_pace": "10-12 hours/week in network telemetry and distributed tracing.",
                    "weight": 25
                },
                {
                    "id": "m3",
                    "month_checkpoint": 3,
                    "title": "GPU Acceleration, CUDA Kernels & Quantization",
                    "description": "Implement custom kernel memory layouts, vLLM / TensorRT-LLM serving pipelines, and 4-bit / 8-bit weight quantization.",
                    "estimated_completion_date": date_at_month(3),
                    "why_it_matters": "Drastically reduces GPU RAM footprint and doubles inference token throughput per dollar.",
                    "required_tasks_or_evidence": "Production latency benchmark under high batch concurrency with 35%+ speedup.",
                    "dependencies": ["Distributed Systems & Asynchronous Networking"],
                    "status": "not_started",
                    "completion_criteria": "Inference gateway serving 50 tokens/sec across multi-GPU cluster without OOM crashes.",
                    "suggested_weekly_pace": "12-15 hours/week on CUDA profiling and benchmark replication.",
                    "weight": 30
                },
                {
                    "id": "m4",
                    "month_checkpoint": 6 if (days_remaining and days_remaining > 90) else 4,
                    "title": "Production Deployment, Observability & Architecture Portfolio",
                    "description": "Full end-to-end multi-tenant cluster deployment with Prometheus metrics, automated canary rollouts, and open-source publication.",
                    "estimated_completion_date": (target_date.strftime("%Y-%m-%d") if target_date else date_at_month(6)),
                    "why_it_matters": "Demonstrates proven production capability ready for Tier-1 AI infrastructure teams.",
                    "required_tasks_or_evidence": "Publicly verified GitHub architecture repository with reproducible benchmarks.",
                    "dependencies": ["GPU Acceleration, CUDA Kernels & Quantization"],
                    "status": "not_started",
                    "completion_criteria": "Passing automated soak tests and production readiness architecture review.",
                    "suggested_weekly_pace": "10 hours/week architecture refinement and technical writing.",
                    "weight": 25
                }
            ]

        elif domain == "fintech_entrepreneur":
            return [
                {
                    "id": "m1",
                    "month_checkpoint": 1,
                    "title": "Market Discovery & Regulatory Sandbox Clearance",
                    "description": "Conduct 30 in-depth merchant discovery interviews, validate underwriting friction, and file sandbox regulatory paperwork.",
                    "estimated_completion_date": date_at_month(1),
                    "why_it_matters": "Financial products succeed or fail on regulatory compliance and verified customer pain points.",
                    "required_tasks_or_evidence": "Documented merchant interview transcripts and signed pilot partner letters of intent.",
                    "dependencies": ["Industry analysis"],
                    "status": "in_progress",
                    "completion_criteria": "Secured regulatory testing approval and 5 committed early merchant pilot partners.",
                    "suggested_weekly_pace": "12-15 hours/week discovery and banking relationship management.",
                    "weight": 20
                },
                {
                    "id": "m2",
                    "month_checkpoint": 2,
                    "title": "Payment Clearing Primitives & MVP Ledger",
                    "description": "Build automated reconciliation API, double-entry transactional accounting ledger, and partner bank webhook bridge.",
                    "estimated_completion_date": date_at_month(2),
                    "why_it_matters": "Financial integrity requires mathematically verified zero-discrepancy balance ledgers.",
                    "required_tasks_or_evidence": "Automated end-of-day bank reconciliation clearing simulated disbursements within 15 seconds.",
                    "dependencies": ["Market Discovery & Regulatory Sandbox Clearance"],
                    "status": "not_started",
                    "completion_criteria": "1,000 test transactions cleared with 99.99% ledger accuracy in staging sandbox.",
                    "suggested_weekly_pace": "15 hours/week software engineering and financial auditing.",
                    "weight": 25
                },
                {
                    "id": "m3",
                    "month_checkpoint": 3,
                    "title": "Live Merchant Pilot & Unit Economics Validation",
                    "description": "Onboard first cohort of 25 live commercial merchants, monitor default rates, and prove positive contribution margins.",
                    "estimated_completion_date": date_at_month(3),
                    "why_it_matters": "Validates that the business model generates sustainable revenue rather than subsidized burn.",
                    "required_tasks_or_evidence": "Live transaction volume dashboard with 30-day cohort retention data.",
                    "dependencies": ["Payment Clearing Primitives & MVP Ledger"],
                    "status": "not_started",
                    "completion_criteria": "Gross transaction volume exceeding target threshold with zero unrecoverable losses.",
                    "suggested_weekly_pace": "15-20 hours/week merchant operations and risk oversight.",
                    "weight": 30
                },
                {
                    "id": "m4",
                    "month_checkpoint": 6 if (days_remaining and days_remaining > 90) else 4,
                    "title": "Institutional Syndication & National Scale Rollout",
                    "description": "Secure tier-1 banking sponsor partner, close institutional debt or venture facility, and expand across 3 commercial hubs.",
                    "estimated_completion_date": (target_date.strftime("%Y-%m-%d") if target_date else date_at_month(6)),
                    "why_it_matters": "Transitions an experimental fintech sandbox into an established market infrastructure.",
                    "required_tasks_or_evidence": "Executed co-lending agreement and audited financial metrics report.",
                    "dependencies": ["Live Merchant Pilot & Unit Economics Validation"],
                    "status": "not_started",
                    "completion_criteria": "Approved nationwide clearing license and formalized liquidity partner agreement.",
                    "suggested_weekly_pace": "15 hours/week partner governance and growth leadership.",
                    "weight": 25
                }
            ]

        elif domain == "medical_resident":
            return [
                {
                    "id": "m1",
                    "month_checkpoint": 1,
                    "title": "Clinical Trauma Protocols & Diagnostic Round Mastery",
                    "description": "Refine pre-dawn patient charting, real-time bedside telemetry correlation, and acute resuscitation decision-making.",
                    "estimated_completion_date": date_at_month(1),
                    "why_it_matters": "Consistent trauma readiness preserves patient safety in volatile emergency ward settings.",
                    "required_tasks_or_evidence": "Flawless morning attending handover logs with zero documented diagnostic omissions.",
                    "dependencies": ["Medical graduation"],
                    "status": "in_progress",
                    "completion_criteria": "Attending surgeon validation of autonomous triage decisions on 20 consecutive shifts.",
                    "suggested_weekly_pace": "Structured reflection during ward handovers and clinical journal study.",
                    "weight": 25
                },
                {
                    "id": "m2",
                    "month_checkpoint": 2,
                    "title": "Specialty ICU Rotation & Telemetry Analytics",
                    "description": "Lead intensive care hemodynamics management and present complex case diagnostic findings at departmental Grand Rounds.",
                    "estimated_completion_date": date_at_month(2),
                    "why_it_matters": "Bridges textbook medical knowledge with high-acuity life-critical patient management.",
                    "required_tasks_or_evidence": "Evaluated Grand Rounds presentation slides and attending clinical reviews.",
                    "dependencies": ["Clinical Trauma Protocols & Diagnostic Round Mastery"],
                    "status": "not_started",
                    "completion_criteria": "Independent management of critical care ventilator and inotropic protocols.",
                    "suggested_weekly_pace": "Weekly case study write-ups and evidence-based medicine reviews.",
                    "weight": 25
                },
                {
                    "id": "m3",
                    "month_checkpoint": 3,
                    "title": "Solo Minimally Invasive Procedures & Board Preparedness",
                    "description": "Perform supervised laparoscopic interventions and achieve 90th percentile score on annual resident in-service exam.",
                    "estimated_completion_date": date_at_month(3),
                    "why_it_matters": "Demonstrates technical surgical competency and medical licensing examination readiness.",
                    "required_tasks_or_evidence": "Surgical logbook entries signed by chief of surgery.",
                    "dependencies": ["Specialty ICU Rotation & Telemetry Analytics"],
                    "status": "not_started",
                    "completion_criteria": "Successful solo surgical rotations and top-quartile practice exam scores.",
                    "suggested_weekly_pace": "Daily surgical simulator practice and licensing question bank drills.",
                    "weight": 25
                },
                {
                    "id": "m4",
                    "month_checkpoint": 6 if (days_remaining and days_remaining > 90) else 4,
                    "title": "Sub-specialty Fellowship Candidacy & Published Research",
                    "description": "Publish clinical retrospective study in peer-reviewed surgical journal and secure fellowship recommendations.",
                    "estimated_completion_date": (target_date.strftime("%Y-%m-%d") if target_date else date_at_month(6)),
                    "why_it_matters": "Secures transition into elite sub-specialty clinical practice and academic leadership.",
                    "required_tasks_or_evidence": "Accepted manuscript and formal fellowship interview invitations.",
                    "dependencies": ["Solo Minimally Invasive Procedures & Board Preparedness"],
                    "status": "not_started",
                    "completion_criteria": "Final chief resident recommendation letter and research publication.",
                    "suggested_weekly_pace": "Clinical manuscript revisions and fellowship portfolio preparation.",
                    "weight": 25
                }
            ]

        elif domain == "product_designer":
            return [
                {
                    "id": "m1",
                    "month_checkpoint": 1,
                    "title": "User Cognitive Ergonomics & Spatial Interaction Audits",
                    "description": "Deconstruct gesture models, spatial latency, and tactile feedback in next-generation computing interfaces.",
                    "estimated_completion_date": date_at_month(1),
                    "why_it_matters": "Interface fluidity eliminates user cognitive friction in everyday spatial workflows.",
                    "required_tasks_or_evidence": "Conducted 15 monitored user usability critiques with quantified motion ergonomics data.",
                    "dependencies": ["Design fundamentals"],
                    "status": "in_progress",
                    "completion_criteria": "Documented ergonomic teardown identifying 10 non-obvious interface friction points.",
                    "suggested_weekly_pace": "8-10 hours/week interactive prototyping and user observation.",
                    "weight": 25
                },
                {
                    "id": "m2",
                    "month_checkpoint": 2,
                    "title": "Design System Architecture & Production Component Library",
                    "description": "Craft comprehensive token-driven design system with responsive spatial primitives and accessible contrast tokens.",
                    "estimated_completion_date": date_at_month(2),
                    "why_it_matters": "Ensures scalable consistency and effortless adoption by engineering development teams.",
                    "required_tasks_or_evidence": "Published Figma component library with corresponding code-ready React components.",
                    "dependencies": ["User Cognitive Ergonomics & Spatial Interaction Audits"],
                    "status": "not_started",
                    "completion_criteria": "Full component library tested across light/dark themes with AAA accessibility ratings.",
                    "suggested_weekly_pace": "10-12 hours/week component design and documentation.",
                    "weight": 25
                },
                {
                    "id": "m3",
                    "month_checkpoint": 3,
                    "title": "Flagship Hardware / Spatial Computing Prototype",
                    "description": "Build high-fidelity working interactive prototype demonstrating humane, clutter-free spatial manipulation.",
                    "estimated_completion_date": date_at_month(3),
                    "why_it_matters": "Tangible proof of innovative vision separating world-class designers from commodity stylists.",
                    "required_tasks_or_evidence": "Interactive demo video and 95%+ usability task completion benchmark.",
                    "dependencies": ["Design System Architecture & Production Component Library"],
                    "status": "not_started",
                    "completion_criteria": "Validated with external test users with zero reported motion fatigue.",
                    "suggested_weekly_pace": "12 hours/week prototype development and interaction tuning.",
                    "weight": 25
                },
                {
                    "id": "m4",
                    "month_checkpoint": 6 if (days_remaining and days_remaining > 90) else 4,
                    "title": "Studio Launch & International Design Award Submission",
                    "description": "Launch independent studio portfolio reel and submit flagship spatial product to Red Dot and iF Design Awards.",
                    "estimated_completion_date": (target_date.strftime("%Y-%m-%d") if target_date else date_at_month(6)),
                    "why_it_matters": "Establishes commercial brand authority and inbound enterprise design client pipeline.",
                    "required_tasks_or_evidence": "Live studio showcase site with press coverage and international entry confirmations.",
                    "dependencies": ["Flagship Hardware / Spatial Computing Prototype"],
                    "status": "not_started",
                    "completion_criteria": "Secured first 3 enterprise design contracts and featured in top design journal.",
                    "suggested_weekly_pace": "10 hours/week portfolio curation and press outreach.",
                    "weight": 25
                }
            ]

        elif domain == "sports_scientist":
            return [
                {
                    "id": "m1",
                    "month_checkpoint": 1,
                    "title": "Biomechanical Motion Tracking & Hurdle Cadence Calibration",
                    "description": "Deploy high-speed telemetry cameras to optimize hurdle approach hip elevation and sprint stride turnover.",
                    "estimated_completion_date": date_at_month(1),
                    "why_it_matters": "Eliminates micro-deceleration points to shave vital fractions of a second safely.",
                    "required_tasks_or_evidence": "Video kinematic analysis and calibrated sub-14 second split time.",
                    "dependencies": ["Athletic baseline"],
                    "status": "in_progress",
                    "completion_criteria": "Consistent stride cadence recorded across 10 high-intensity hurdle intervals.",
                    "suggested_weekly_pace": "15-18 hours/week track drills, mobility, and video review.",
                    "weight": 25
                },
                {
                    "id": "m2",
                    "month_checkpoint": 2,
                    "title": "Lactate Curve Conditioning & Multi-Event Synergy",
                    "description": "Tune physiological metabolic clearance across high jump, shot put, and 400m sprint back-to-back testing cycles.",
                    "estimated_completion_date": date_at_month(2),
                    "why_it_matters": "Decathlon requires stamina conservation across ten grueling multi-disciplinary trials.",
                    "required_tasks_or_evidence": "Metabolic lactate clearance telemetry logs showing 30% faster recovery curves.",
                    "dependencies": ["Biomechanical Motion Tracking & Hurdle Cadence Calibration"],
                    "status": "not_started",
                    "completion_criteria": "Completing full mock decathlon sequence without muscular exhaustion spikes.",
                    "suggested_weekly_pace": "20 hours/week multi-event rotation and sports science recovery.",
                    "weight": 25
                },
                {
                    "id": "m3",
                    "month_checkpoint": 3,
                    "title": "National Championship Qualifying Trial Standard",
                    "description": "Compete at regional athletics grand prix and hit official Olympic/national selection point threshold.",
                    "estimated_completion_date": date_at_month(3),
                    "why_it_matters": "Transforms training analytics into verified competitive qualification.",
                    "required_tasks_or_evidence": "Official federation score sheet validating national qualifying marks.",
                    "dependencies": ["Lactate Curve Conditioning & Multi-Event Synergy"],
                    "status": "not_started",
                    "completion_criteria": "Total decathlon score exceeding national qualifying criteria.",
                    "suggested_weekly_pace": "Peak performance tapering and mental visualization drills.",
                    "weight": 25
                },
                {
                    "id": "m4",
                    "month_checkpoint": 6 if (days_remaining and days_remaining > 90) else 4,
                    "title": "International Training Camp & Continental Medal Podiums",
                    "description": "Selected to national squad delegation, attend high-altitude training camp, and compete at Asian Grand Prix.",
                    "estimated_completion_date": (target_date.strftime("%Y-%m-%d") if target_date else date_at_month(6)),
                    "why_it_matters": "Reaches pinnacle international athletics and athletic longevity mastery.",
                    "required_tasks_or_evidence": "Medal podium result and biometric telemetry publication.",
                    "dependencies": ["National Championship Qualifying Trial Standard"],
                    "status": "not_started",
                    "completion_criteria": "Personal best score posted in international federation competition.",
                    "suggested_weekly_pace": "Full-time professional athletic regimen and physiological monitoring.",
                    "weight": 25
                }
            ]

        else: # general_mastery
            return [
                {
                    "id": "m1",
                    "month_checkpoint": 1,
                    "title": f"Foundation & Skill Diagnostics for {goal_title}",
                    "description": f"Master foundational mechanics and build the initial daily practice routine for {goal_title}.",
                    "estimated_completion_date": date_at_month(1),
                    "why_it_matters": "Strong fundamentals ensure long-term sustainability without early burnout.",
                    "required_tasks_or_evidence": "Completed foundational study exercises and baseline competency review.",
                    "dependencies": ["Initial commitment"],
                    "status": "in_progress",
                    "completion_criteria": "80%+ task completion across first 30 days of consistent effort.",
                    "suggested_weekly_pace": "6-8 hours/week dedicated focused practice.",
                    "weight": 25
                },
                {
                    "id": "m2",
                    "month_checkpoint": 2,
                    "title": f"Intermediate Application & Practical Projects for {goal_title}",
                    "description": "Build real-world application projects and stress-test skills under simulated real-world conditions.",
                    "estimated_completion_date": date_at_month(2),
                    "why_it_matters": "Converts theoretical knowledge into instinctive, repeatable competence.",
                    "required_tasks_or_evidence": "Delivered intermediate project review or verified external output.",
                    "dependencies": [f"Foundation & Skill Diagnostics for {goal_title}"],
                    "status": "not_started",
                    "completion_criteria": "Successful completion of first comprehensive capstone project.",
                    "suggested_weekly_pace": "8-10 hours/week hands-on execution.",
                    "weight": 25
                },
                {
                    "id": "m3",
                    "month_checkpoint": 3,
                    "title": f"Advanced Competency & Peer Critique for {goal_title}",
                    "description": "Solve high-complexity challenges, seek mentor critique, and refine specialized sub-disciplines.",
                    "estimated_completion_date": date_at_month(3),
                    "why_it_matters": "Refines quality from good to industry-standard excellence.",
                    "required_tasks_or_evidence": "Mentor or supervisor assessment evaluating work against professional standards.",
                    "dependencies": [f"Intermediate Application & Practical Projects for {goal_title}"],
                    "status": "not_started",
                    "completion_criteria": "Zero major deficiencies noted in comprehensive milestone evaluation.",
                    "suggested_weekly_pace": "10 hours/week deliberate practice and refinement.",
                    "weight": 25
                },
                {
                    "id": "m4",
                    "month_checkpoint": 6 if (days_remaining and days_remaining > 90) else 4,
                    "title": f"Ultimate Mastery & Target Realization: {goal_title}",
                    "description": "Full goal realization, public portfolio release, and successful transition into the target ambition.",
                    "estimated_completion_date": (target_date.strftime("%Y-%m-%d") if target_date else date_at_month(6)),
                    "why_it_matters": "Marks the culmination of the journey from aspiration to reality.",
                    "required_tasks_or_evidence": "Final tangible artifact, certification, launch, or documented achievement.",
                    "dependencies": [f"Advanced Competency & Peer Critique for {goal_title}"],
                    "status": "not_started",
                    "completion_criteria": "Official achievement of stated ambition parameters.",
                    "suggested_weekly_pace": "Sustained momentum and professional networking.",
                    "weight": 25
                }
            ]

    @classmethod
    def _merge_existing_milestones(
        cls,
        generated: List[Dict[str, Any]],
        existing: List[Dict[str, Any]],
        user_tasks: List[Task]
    ) -> List[Dict[str, Any]]:
        # If user has customized their milestones in Goal, respect completion status & custom titles
        existing_by_id = {m.get("id"): m for m in existing if m.get("id")}
        
        # Count completed tasks associated with milestone IDs
        completed_tasks_by_m = {}
        for t in user_tasks:
            if t.status == "completed" and t.milestone_id:
                completed_tasks_by_m[t.milestone_id] = completed_tasks_by_m.get(t.milestone_id, 0) + 1

        result = []
        for g in generated:
            m_id = g["id"]
            if m_id in existing_by_id:
                ex = existing_by_id[m_id]
                is_comp = ex.get("completed", False)
                g["status"] = "completed" if is_comp else g["status"]
                g["title"] = ex.get("title", g["title"])
                g["weight"] = ex.get("weight", g["weight"])
            
            # If user has completed tasks for this milestone but not marked complete, ensure status is in_progress
            if completed_tasks_by_m.get(m_id, 0) > 0 and g["status"] != "completed":
                g["status"] = "in_progress"
                g["completed_tasks_count"] = completed_tasks_by_m[m_id]
            result.append(g)
            
        return result

    @classmethod
    def _assess_feasibility(
        cls,
        domain: str,
        days_remaining: Optional[int],
        milestone_count: int,
        is_overdue: bool
    ) -> Dict[str, Any]:
        if days_remaining is None:
            return {
                "assessment": "Provisional Roadmap (No Target Deadline Set)",
                "feasibility_score": 85,
                "advice": "Set a target date to establish a structured urgency timeline and monthly checkpoints.",
                "alternatives": ["Choose a 3-month, 6-month, or 1-year target completion date."]
            }

        if is_overdue:
            return {
                "assessment": "Overdue / Reassessment Required",
                "feasibility_score": 30,
                "advice": f"Your target date passed {abs(days_remaining)} days ago. Restructure your deadline into achievable milestones.",
                "alternatives": [
                    "Extend your target date by 60-90 days to accommodate unfinished deliverables.",
                    "Break the remaining milestones into a phased Part 2 timeline.",
                    "Adjust weekly study or work hours to clear outstanding bottlenecks."
                ]
            }

        # Check if duration is too aggressive for complex domains
        if days_remaining < 60 and domain in ["ai_systems_engineer", "medical_resident", "fintech_entrepreneur"]:
            return {
                "assessment": "Highly Ambitious Timeline",
                "feasibility_score": 60,
                "advice": f"{days_remaining} days is very compressed for full mastery in {domain.replace('_', ' ').title()}. Recommend pacing fundamentals sustainably.",
                "alternatives": [
                    "Extend the horizon to 6 months to allow deeper systems debugging and project portfolio work.",
                    "Scope Month 1 strictly to MVP prototype rather than full enterprise deployment.",
                    "Increase weekly dedicated practice time to 18-20 hours/week."
                ]
            }

        if days_remaining >= 60 and days_remaining <= 365:
            return {
                "assessment": "Well-Calibrated & Achievable",
                "feasibility_score": 95,
                "advice": f"{days_remaining} days provides an optimal balance between urgency and thorough competence building.",
                "alternatives": [
                    "Maintain steady daily task consistency of 8-12 hours per week.",
                    "Review monthly checkpoints at Day 30 and Day 60 to verify velocity."
                ]
            }

        return {
            "assessment": "Long-Term Strategic Horizon",
            "feasibility_score": 90,
            "advice": f"{days_remaining} days allows comprehensive multi-phase progression through intermediate certifications and capstones.",
            "alternatives": [
                "Focus primarily on Month 1 and Month 2 checkpoints to maintain present-day urgency.",
                "Set quarterly milestones rather than delaying evaluations to the end."
            ]
        }

    @classmethod
    def _generate_default_provisional_roadmap(cls, now: datetime) -> Dict[str, Any]:
        return {
            "domain": "general_mastery",
            "goal_title": "Define Your Destination Goal",
            "current_situation": "Starting fresh",
            "target_date": None,
            "days_remaining": None,
            "is_overdue": False,
            "schedule_status": "provisional",
            "feasibility": {
                "assessment": "Provisional Starter Roadmap",
                "feasibility_score": 80,
                "advice": "Add a final ambition in settings or onboarding to unlock custom career milestones.",
                "alternatives": ["Set your target completion date to activate deadline tracking."]
            },
            "milestones": [
                {
                    "id": "m1",
                    "month_checkpoint": 1,
                    "title": "Establish Habit Consistency & Core Primitives",
                    "description": "Build a reliable daily routine by completing 80%+ of scheduled tasks across the first 30 days.",
                    "estimated_completion_date": (now + timedelta(days=30)).strftime("%Y-%m-%d"),
                    "why_it_matters": "Momentum begins with unbroken daily continuity.",
                    "required_tasks_or_evidence": "30 days of persistent daily tasks and streak momentum.",
                    "dependencies": ["Daily task execution"],
                    "status": "in_progress",
                    "completion_criteria": "Active streak exceeding 7 qualifying consecutive days.",
                    "suggested_weekly_pace": "6-8 hours/week",
                    "weight": 25
                },
                {
                    "id": "m2",
                    "month_checkpoint": 2,
                    "title": "Define Core Specialization & First Capstone",
                    "description": "Select specific ambition focus and assemble your initial tangible project or case study.",
                    "estimated_completion_date": (now + timedelta(days=60)).strftime("%Y-%m-%d"),
                    "why_it_matters": "Provides focus and evidence of applied skill.",
                    "required_tasks_or_evidence": "First completed milestone project documented in timeline.",
                    "dependencies": ["Establish Habit Consistency & Core Primitives"],
                    "status": "not_started",
                    "completion_criteria": "Documented capstone deliverable.",
                    "suggested_weekly_pace": "8-10 hours/week",
                    "weight": 25
                },
                {
                    "id": "m3",
                    "month_checkpoint": 3,
                    "title": "Advanced Execution & Peer Demonstration",
                    "description": "Demonstrate intermediate competence under realistic deadlines and external review.",
                    "estimated_completion_date": (now + timedelta(days=90)).strftime("%Y-%m-%d"),
                    "why_it_matters": "Tests capabilities under real pressure.",
                    "required_tasks_or_evidence": "Peer critique and stress-tested project output.",
                    "dependencies": ["Define Core Specialization & First Capstone"],
                    "status": "not_started",
                    "completion_criteria": "Passing comprehensive review.",
                    "suggested_weekly_pace": "10 hours/week",
                    "weight": 25
                },
                {
                    "id": "m4",
                    "month_checkpoint": 6,
                    "title": "Final Goal Realization",
                    "description": "Achieve full career or creative milestone through steady cumulative progress.",
                    "estimated_completion_date": (now + timedelta(days=180)).strftime("%Y-%m-%d"),
                    "why_it_matters": "The ultimate destination of your personal series.",
                    "required_tasks_or_evidence": "Final verified portfolio or career milestone achievement.",
                    "dependencies": ["Advanced Execution & Peer Demonstration"],
                    "status": "not_started",
                    "completion_criteria": "Stated goal fully accomplished.",
                    "suggested_weekly_pace": "Sustained weekly effort.",
                    "weight": 25
                }
            ],
            "summary": {
                "total_milestones": 4,
                "completed_milestones": 0,
                "remaining_milestones": 4,
                "current_milestone": "Establish Habit Consistency & Core Primitives",
                "next_milestone_deadline": (now + timedelta(days=30)).strftime("%Y-%m-%d")
            }
        }

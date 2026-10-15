"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Play,
  Film,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  Clock,
  Layers,
  FileText,
  Calendar,
  ChevronRight
} from "lucide-react";

interface DemoCharacter {
  key: string;
  name: string;
  role: string;
  nationality: string;
  goal: string;
  biography: string;
  seriesTitle: string;
  videoSrc: string;
  sampleScript: string;
  timelineHighlights: string[];
  outcomes: {
    seventy: string;
    eighty: string;
    hundred: string;
  };
}

const DEMO_LIVES: DemoCharacter[] = [
  {
    key: "cary",
    name: "Cary Vance",
    role: "Startup CEO & Founder",
    nationality: "San Francisco, USA",
    goal: "Scale an enterprise intelligence company through series A funding and sustainable unit economics.",
    biography: "Former product architect turned founder navigating volatile investor markets, executive hiring, and high-stakes board reviews.",
    seriesTitle: "The Founder's Crucible",
    videoSrc: "/demo/cary/day-01/episode-a.mp4",
    sampleScript: `[SCENE 1: Office Arrival - 06:45 AM]\nNarration: Cary enters the empty headquarters with the finalized quarterly metrics deck. Every assumption has been stress-tested.\n\n[SCENE 2: The Audit Meeting]\nCary: "We aren't just selling software. We are giving teams clarity in moments of peak uncertainty."\nNarration: The lead partner reviews the retention cohorts. The data holds without a single discrepancy.\n\n[SCENE 3: The Term Sheet]\nNarration: Approval secured. As Cary walks back onto Market Street, a new investor inquiry signals that tomorrow's expansion has already begun.`,
    timelineHighlights: [
      "Day 1: Audited quarterly metrics and secured executive committee sign-off",
      "Day 30: Shipped enterprise multi-tenant cloud architecture",
      "Day 90: Closed oversubscribed venture round",
    ],
    outcomes: {
      seventy: "Board asks for further gross margin optimization before issuing final tranche.",
      eighty: "Cohorts validated; term sheet received with standard governance covenants.",
      hundred: "Unanimous partner sign-off and expansion lead invited to join advisory board.",
    },
  },
  {
    key: "meera",
    name: "Meera Patel",
    role: "AI Systems Engineer",
    nationality: "Bengaluru, India",
    goal: "Design and deploy low-latency, fault-tolerant distributed LLM inference clusters.",
    biography: "Passionate systems researcher transitioning from academic algorithms into production machine learning infrastructure.",
    seriesTitle: "Silicon Synapse",
    videoSrc: "/demo/meera/day-01/episode-a.mp4",
    sampleScript: `[SCENE 1: Server Laboratory - 08:00 AM]\nNarration: Meera inspects the GPU cluster telemetry. Latency spikes during peak quantization tests must be resolved before noon.\n\n[SCENE 2: Pipeline Profiling]\nMeera: "If we optimize the kernel memory layout, we cut throughput bottlenecks by forty percent."\nNarration: She pushes the updated CUDA kernel. Benchmarks run green across all sixteen nodes.\n\n[SCENE 3: Deployment Success]\nNarration: The infrastructure team confirms zero dropped packets. A mentor nods from across the lab—the inference gateway is live.`,
    timelineHighlights: [
      "Day 1: Optimized custom memory kernels and eliminated inference latency spikes",
      "Day 45: Deployed multi-GPU speculative decoding pipeline",
      "Day 120: Published open-source benchmark recognized by core maintainers",
    ],
    outcomes: {
      seventy: "Quantization holds but edge latency requires additional cache tuning.",
      eighty: "Clean memory allocation; inference speed increased by 35%.",
      hundred: "Record benchmark posted; engineering director greenlights cluster deployment.",
    },
  },
  {
    key: "aarav",
    name: "Aarav Singhania",
    role: "Fintech Entrepreneur",
    nationality: "Mumbai, India",
    goal: "Build an accessible credit scoring and automated payment infrastructure for informal businesses.",
    biography: "Former financial analyst creating open banking primitives to eliminate predatory informal lending.",
    seriesTitle: "The Sovereign Ledger",
    videoSrc: "/demo/aarav/day-01/episode-a.mp4",
    sampleScript: `[SCENE 1: Financial District - 09:15 AM]\nNarration: Aarav steps out of the banking regulator's office with the sandbox compliance checklist.\n\n[SCENE 2: Merchant Discovery Interview]\nAarav: "Our system calculates working capital risk from real daily vendor receipts, not credit cards."\nNarration: A local shopkeeper tests the micro-disbursement API. The funds clear in twelve seconds.\n\n[SCENE 3: Regulatory Greenlight]\nNarration: The sandbox supervisor signs the trial pilot approval. Aarav checks his notebook—tomorrow begins the multi-city pilot.`,
    timelineHighlights: [
      "Day 1: Conducted merchant customer discovery and verified sandbox gateway",
      "Day 60: Onboarded first 50 merchants on automated reconciliation API",
      "Day 150: Approved for nationwide payment aggregator testing license",
    ],
    outcomes: {
      seventy: "Sandbox approved with restrictive daily volume quotas.",
      eighty: "Full sandbox clearance; first batch of merchant interviews completed.",
      hundred: "Tier-1 banking partner agrees to sponsor direct API clearing rail.",
    },
  },
  {
    key: "ananya",
    name: "Dr. Ananya Iyer",
    role: "Medical Resident",
    nationality: "Delhi, India",
    goal: "Excel through clinical residency while integrating predictive telemetry in pediatric intensive care.",
    biography: "Dedicated surgical trainee striving to master complex trauma protocols and empathetic patient advocacy.",
    seriesTitle: "The Vital Thread",
    videoSrc: "/demo/ananya/day-01/episode-a.mp4",
    sampleScript: `[SCENE 1: Clinical Wards - 06:00 AM]\nNarration: Ananya completes pre-dawn rounds. Every patient chart is cross-referenced with overnight telemetry.\n\n[SCENE 2: Attending Rounds]\nAttending Surgeon: "What is your diagnosis on Bed Four, Dr. Iyer?"\nAnanya: "Early signs of systemic inflammation. We adjusted the fluid protocol forty minutes ago."\nNarration: The chief nods in quiet approval. The intervention caught the complication before it peaked.\n\n[SCENE 3: Evening Handover]\nNarration: Handing over the pager to the night team, Ananya reflects on the day's calm precision. A life stabilized, a doctor forged.`,
    timelineHighlights: [
      "Day 1: Mastered morning trauma rounds and identified critical telemetry anomaly",
      "Day 80: Successfully performed first solo laparoscopic emergency procedure",
      "Day 200: Presented intensive care clinical findings at national surgical symposium",
    ],
    outcomes: {
      seventy: "Rounds completed accurately, but paperwork backlog carries over.",
      eighty: "Early telemetry diagnosis validated; patient vital signs stabilize.",
      hundred: "Chief of surgery recommends Ananya for specialty ICU fellowship track.",
    },
  },
  {
    key: "riya",
    name: "Riya Sen",
    role: "Lead Product Designer",
    nationality: "London, UK",
    goal: "Establish an independent design studio crafting intuitive spatial computing products.",
    biography: "Human-computer interaction designer redefining how everyday people manipulate holographic and spatial interfaces.",
    seriesTitle: "Form & Friction",
    videoSrc: "/demo/riya/day-01/episode-a.mp4",
    sampleScript: `[SCENE 1: Studio Workshop - 08:30 AM]\nNarration: Sunlight floods Riya's drafting table. Physical foam models sit alongside spatial headset prototypes.\n\n[SCENE 2: The Usability Critique]\nRiya: "If the tactile gesture requires conscious thought, the interface has failed."\nNarration: She refines the micro-haptic feedback curve. The test user smiles—the virtual control feels tangible.\n\n[SCENE 3: Keynote Showcase]\nNarration: The design showcase audience applauds as the spatial design reel plays. International design awards open tomorrow.`,
    timelineHighlights: [
      "Day 1: Solved tactile feedback threshold on spatial navigation prototype",
      "Day 75: Released design system adopted by 10,000 developers worldwide",
      "Day 180: Won Red Dot best-of-the-best for humane computing hardware",
    ],
    outcomes: {
      seventy: "Prototype passes internal tests, but ergonomics review requires adjustments.",
      eighty: "Usability score hits 94%; motion sickness latency eliminated.",
      hundred: "Design system featured on front page of leading design publication.",
    },
  },
  {
    key: "arjun",
    name: "Arjun Rathore",
    role: "Decathlete & Sports Scientist",
    nationality: "Chandigarh, India",
    goal: "Represent the national team in the decathlon while applying metabolic telemetry to athletic longevity.",
    biography: "Elite multi-discipline athlete using biomechanics and lactate recovery curves to push human physical endurance.",
    seriesTitle: "The Measured Breath",
    videoSrc: "/demo/arjun/day-01/episode-a.mp4",
    sampleScript: `[SCENE 1: Athletic Track - 05:30 AM]\nNarration: The morning mist hangs over the stadium. Arjun sets up his high-speed motion tracking cameras along the hurdle lane.\n\n[SCENE 2: Biomechanical Analysis]\nCoach: "Your stride cadence at hurdle four was clipped by two hundredths."\nArjun: "Adjusting hip elevation on approach—watch this rep."\nNarration: He powers through the lane. The sensor screen flashes a personal best time.\n\n[SCENE 3: Recovery Protocol]\nNarration: Hydrating after sprint intervals, Arjun reviews his metabolic recovery score. Tomorrow: pole vault technique.`,
    timelineHighlights: [
      "Day 1: Calibrated hurdle biomechanics and clocked sub-14 second split",
      "Day 90: Achieved national qualifying standard in pole vault and long jump",
      "Day 220: Won gold at Asian athletics grand prix with national record score",
    ],
    outcomes: {
      seventy: "Cadence improved, but minor hamstring tightness requires physiotherapy.",
      eighty: "Personal best clocked on hurdle approach; lactate recovery normal.",
      hundred: "National qualifying standard met; coach approves international training camp.",
    },
  },
  {
    key: "elena",
    name: "Elena Rostova",
    role: "Technology Founder & CEO",
    nationality: "Stockholm, Sweden",
    goal: "Scale an enterprise autonomous AI infrastructure platform to global Fortune 500 deployments.",
    biography: "Deep-tech operator with a background in distributed systems and fault-tolerant algorithmic design.",
    seriesTitle: "The Autonomous Edge",
    videoSrc: "/demo/cary/day-01/episode-a.mp4",
    sampleScript: `[SCENE 1: Autonomous Systems Lab - 07:30 AM]\nNarration: Elena reviews the edge deployment telemetry. Distributed inference latency dropped under five milliseconds.\n\n[SCENE 2: The Enterprise Pitch]\nElena: "We do not sell models. We sell mission-critical operational resilience."\nNarration: The enterprise CTO reviews the failover benchmarks and signs the deployment contract.\n\n[SCENE 3: Global Cluster Launch]\nNarration: As nodes activate across Frankfurt and Singapore, Elena's tactical focus turns to tomorrow's quantum-resistant protocol.`,
    timelineHighlights: [
      "Day 1: Audited multi-region inference clusters and achieved zero packet loss",
      "Day 45: Closed multi-million enterprise recurring infrastructure contract",
      "Day 100: Deployed autonomous cluster across 12 worldwide tier-4 data centers",
    ],
    outcomes: {
      seventy: "Cluster performance holds, but compliance latency requires security review.",
      eighty: "All benchmark thresholds passed; enterprise lead signs pilot expansion.",
      hundred: "Flawless deployment demonstration; international partner agrees to direct API integration.",
    },
  },
];

export default function ExploreOtherLivesPage() {
  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#393B4B] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Compass className="w-5 h-5 text-[#A8E6CF]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A8E6CF]">
              Inspirational Gallery
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F6F5F8]">Explore Other Lives</h1>
          <p className="text-xs sm:text-sm text-[#858B98] mt-1 max-w-2xl">
            Sample journeys, verified demonstration episodes, and branching story outcomes. Observing these lives gives inspiration without altering your personal account, goals, or daily tasks.
          </p>
        </div>

        <Link
          href="/timeline"
          className="px-4 py-2 rounded-xl bg-[#20232E] border border-[#393B4B] text-xs font-bold text-[#F6F5F8] hover:border-[#A8E6CF] transition-all self-start md:self-auto flex items-center space-x-1.5"
        >
          <span>My Personal Timeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Demo Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_LIVES.map((char) => (
          <div
            key={char.key}
            className="glass-panel rounded-2xl overflow-hidden border border-[#393B4B] hover:border-[#A8E6CF]/60 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Top Preview Section */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8E6CF] bg-[#A8E6CF]/10 px-2 py-0.5 rounded border border-[#A8E6CF]/30">
                    {char.role}
                  </span>
                  <h3 className="text-xl font-bold text-[#F6F5F8] mt-1 group-hover:text-[#A8E6CF] transition-colors">
                    {char.name}
                  </h3>
                  <p className="text-[11px] text-[#858B98]">{char.nationality}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-[#858B98] flex items-center space-x-1">
                  <Target className="w-3 h-3 text-[#A8E6CF]" />
                  <span>Final Ambition</span>
                </span>
                <p className="text-xs text-[#F6F5F8] leading-relaxed line-clamp-2">
                  {char.goal}
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-bold text-[#858B98] flex items-center space-x-1">
                  <Film className="w-3 h-3 text-[#FFB347]" />
                  <span>Sample Series</span>
                </span>
                <p className="text-xs font-semibold text-[#A8E6CF]">{char.seriesTitle}</p>
              </div>

              <p className="text-xs text-[#858B98] line-clamp-2 leading-relaxed pt-1">
                {char.biography}
              </p>
            </div>

            {/* Bottom Actions: Full Page Character Story Route */}
            <div className="p-6 pt-0 border-t border-[#393B4B]/60 flex items-center justify-between gap-3 mt-4">
              <Link
                href={`/explore-other-lives/${char.key}`}
                className="w-full py-2.5 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-xs font-bold text-[#14151D] transition-all text-center flex items-center justify-center space-x-2 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>View 5-Day Story & Timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

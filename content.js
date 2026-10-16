/* Public portfolio content. Keep employer work high-level and exclude confidential details. */
window.PORTFOLIO_CONTENT = {
  projects: [
    {
      id: "streaming-operations",
      category: "streaming",
      number: "01",
      eyebrow: "STREAMING OPERATIONS · CURRENT ROLE",
      title: "The work behind a dependable stream.",
      description: "I work across technical operations, partner coordination, launch readiness, and service reliability for a streaming platform. My focus is helping teams know what is ready, what needs attention, and what comes next.",
      tags: ["Launch readiness", "Partner coordination", "Service operations"],
      href: "https://www.linkedin.com/in/chrisjrovira/",
      linkLabel: "Professional profile",
      visual: "stream-visual",
      mark: "OPS",
      featured: true
    },
    {
      id: "oneirodex",
      category: "building",
      number: "02",
      eyebrow: "PERSONAL PROJECT · FULL-STACK",
      title: "A home library with room to play.",
      description: "Oneirodex is a self-hosted game library for a household, pairing a Flask service with a React interface for discovery, sharing, and play.",
      tags: ["Flask + React", "Self-hosted", "Product thinking"],
      href: "https://github.com/cephyrixzyth/Oneirodex",
      linkLabel: "Explore Oneirodex",
      visual: "library-visual",
      mark: "OD",
      featured: true
    },
    {
      id: "oneirodex-web",
      category: "building",
      number: "03",
      eyebrow: "PRODUCT STORY · WEBSITE",
      title: "A clear window into the product.",
      description: "I built the companion site to make Oneirodex easier to understand before opening the app, with interface captures, short walkthroughs, and a feature guide.",
      tags: ["Responsive web", "Product storytelling", "Frontend"],
      href: "https://github.com/cephyrixzyth/Oneirodex-Website",
      linkLabel: "See website repo",
      visual: "website-visual",
      mark: "WEB",
      featured: false
    },
    {
      id: "att-launch",
      category: "streaming",
      number: "04",
      eyebrow: "LAUNCH SUPPORT · AT&T TV",
      title: "A live lineup, ready for launch.",
      description: "At AT&T Entertainment Group, I supported AT&T TV NOW and AT&T TV launches, coordinating content, partner details, and team handoffs through complex service rollouts.",
      tags: ["Launch operations", "Partner coordination", "Content delivery"],
      href: "https://www.linkedin.com/in/chrisjrovira/",
      linkLabel: "Professional profile",
      visual: "launch-visual",
      mark: "LIVE",
      featured: false
    }
  ],
  stories: [
    {
      id: "operations-approach",
      shortTitle: "Operations that connect the dots",
      eyebrow: "STREAMING · OPERATIONS",
      title: "Clear handoffs help teams move with confidence.",
      highlight: "READINESS · COORDINATION · RELIABILITY",
      paragraphs: [
        "My current work brings technical operations, partner coordination, and launch readiness together for a streaming platform.",
        "I aim to make the next step clear for the people doing the work, while keeping the viewer experience in mind."
      ],
      visual: "story-art-operations",
      media: null
    },
    {
      id: "att-live-launch",
      shortTitle: "AT&T TV launch support",
      eyebrow: "AT&T ENTERTAINMENT GROUP · LAUNCH SUPPORT",
      title: "Helping a broad live lineup arrive as one service.",
      highlight: "CONTENT · PARTNERS · LAUNCH READINESS",
      paragraphs: [
        "I supported the AT&T TV NOW and AT&T TV launches, helping coordinate content, partner details, and team handoffs.",
        "The work depended on keeping content, partner details, and teams aligned through a complex delivery process."
      ],
      visual: "story-art-launch",
      media: null
    },
    {
      id: "roku-launches",
      shortTitle: "Streaming launches & live events",
      eyebrow: "STREAMING · SUBSCRIPTIONS · LIVE EVENTS",
      title: "Launch work across services, markets, and live programming.",
      highlight: "LAUNCH READINESS · CONTENT OPERATIONS · EVENT SUPPORT",
      paragraphs: [
        "My supplied résumé lists launch readiness and operations support for Discovery+ Premium Subscriptions, Paramount+, Howdy Mexico, Peacock, Fox One, Apple TV Mexico, Max Mexico, and Tennis Channel.",
        "It also lists content and event operations for WEIRD, Spiderwick, Formula E, and the FIFA World Cup. These are team launches and programs I supported; the names describe the work, not sole ownership. I keep Roku-specific operating details off this public page."
      ],
      visual: "story-art-operations",
      media: null
    },
    {
      id: "international-delivery",
      shortTitle: "Digital video, across destinations",
      eyebrow: "VIACOM INTERNATIONAL · PARTNER DELIVERY",
      title: "Taking digital video from post-production to partners.",
      highlight: "VOD · DTO · SVOD · INTERNATIONAL",
      paragraphs: [
        "At Viacom International, I led digital video delivery and post-production work for transactional and subscription partners, while onboarding partners and supporting international distribution.",
        "That experience taught me to keep creative intent and technical requirements in view at the same time."
      ],
      visual: "story-art-international",
      media: null
    },
    {
      id: "creative-roots",
      shortTitle: "From the edit bay onward",
      eyebrow: "EARLIER CAREER · POST-PRODUCTION",
      title: "A foundation in the craft of picture and sound.",
      highlight: "VIDEO EDITING · AUDIO · POST-PRODUCTION",
      paragraphs: [
        "I started in video editing, audio engineering, and post-production across studios, freelance projects, and film.",
        "That creative foundation still shapes how I approach operations: delivery is part of the story, and the systems behind it should protect the work."
      ],
      visual: "story-art-craft",
      media: null,
      links: [
        { label: "IMDb · nm2474609", url: "https://www.imdb.com/name/nm2474609/" },
        { label: "IMDb · nm8298914", url: "https://www.imdb.com/name/nm8298914/" }
      ]
    }
  ],
  experience: [
    {
      company: "Roku",
      title: "Senior Technical Operations Manager",
      dates: "Nov 2020 to Present",
      place: "Austin, Texas",
      summary: "Technical operations for a streaming platform, with a focus on launch readiness, partner coordination, delivery reliability, and clear operating practices.",
      points: ["Coordinate operational readiness across teams and partners", "Support dependable streaming services and delivery workflows", "Improve documentation, escalation, and day-to-day operating practices"],
      current: true
    },
    {
      company: "AT&T Entertainment Group",
      title: "Integration Manager · Content & Programming Manager",
      dates: "Nov 2016 to Feb 2020",
      place: "San Diego, California",
      summary: "Managed live and on-demand service integrations across platforms, providers, and backend systems.",
      points: ["Supported DIRECTV NOW and AT&T TV launches", "Onboarded live channels and partners", "Integrated rights and availability workflows for regional sports programming"],
      current: false
    },
    {
      company: "Viacom International",
      title: "Partner Manager & Supervising Editor · VOD / DTO / SVOD",
      dates: "Mar 2011 to Sep 2016",
      place: "New York, New York",
      summary: "Led digital video delivery and post-production work for transactional and subscription video partners.",
      points: ["Managed editors and delivery workflows", "Onboarded partners and supported international distribution", "Worked across services including Netflix, iTunes, and Amazon"],
      current: false
    },
    {
      company: "Bigfoot Entertainment",
      title: "Assistant Post Supervisor · On-line Editor",
      dates: "Mar 2010 to Jan 2011",
      place: "Cebu, Philippines",
      summary: "Worked across post-production, online editing, and audio for Bigfoot Studios.",
      points: ["Contributed to post-production on Deep Gold", "Managed editing stations and supported editors", "Helped prepare film and sound deliverables"],
      current: false
    },
    {
      company: "Eastern Video",
      title: "Video Editor · Audio Engineer (Freelance)",
      dates: "Apr 2009 to Nov 2009",
      place: "Miami, Florida",
      summary: "Edited local commercials and prepared media for broadcast, disc, and digital delivery.",
      points: ["Edited video and created supporting graphics", "Encoded video for broadcast and tape", "Prepared DVD and Blu-ray deliverables"],
      current: false
    },
    {
      company: "Arch-Creek Pictures",
      title: "Studio Manager · Video Editor · Audio Engineer",
      dates: "Feb 2006 to Mar 2010",
      place: "Miami, Florida",
      summary: "Managed a creative production studio and its day-to-day client, asset, and post-production workflows.",
      points: ["Managed incoming clients across video and audio suites", "Edited EPKs, promos, and short-form video projects", "Created disc and streaming deliverables and managed archives"],
      current: false
    }
  ],
  skills: ["Streaming operations", "Launch readiness", "Content delivery", "Partner integrations", "Incident management", "Media workflows", "Metadata & XML", "Technical program delivery", "Linux", "SQL", "Video & audio post"],
  credentials: [
    "SAFe 4.0 Certification · Scaled Agile",
    "LPI Linux Essentials · Linux Academy",
    "AWS Concepts · Linux Academy",
    "DevOps Essentials · Linux Academy",
    "SQL Primer · Linux Academy",
    "Python 3 Scripting for System Administrators · Linux Academy",
    "Bash Scripting · Linux Academy",
    "Containers & Orchestration · Linux Academy",
    "Network Routing Fundamentals · Linux Academy",
    "Elastic Stack Essentials · Linux Academy",
    "Intro to Programming Nanodegree · Udacity",
    "Pro Tools Certification · SAE Institute",
    "Audio Engineering Diploma · SAE Institute",
    "Associate of Arts, Computer Science · Miami Dade College"
  ]
};


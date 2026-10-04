/* Keep career and project content here so new Roku case studies can be added without reworking the page layout. */
window.PORTFOLIO_CONTENT = {
  projects: [
    {
      id: "roku-ops",
      category: "streaming",
      number: "01",
      eyebrow: "STREAMING OPERATIONS · ROKU",
      title: "A smoother path from partner to playback.",
      description: "At Roku, I help keep the path from partner delivery to playback running smoothly across live, on-demand, SVOD, and AVOD. That means getting into the details of internal tools, CDN monitoring, integrations, and the on-call work behind The Roku Channel.",
      tags: ["SVOD / AVOD / Live / EPG", "CDN", "The Roku Channel"],
      href: "https://www.roku.com/",
      linkLabel: "Roku",
      visual: "stream-visual",
      mark: "R",
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
      eyebrow: "PRODUCT STORY · ONEIRODEX WEBSITE",
      title: "A clear window into the product.",
      description: "I built the companion site to make Oneirodex easier to understand before you open the app: real interface captures, short captioned walkthroughs, and a feature guide you can explore at your own pace.",
      tags: ["Responsive web", "Real product UI", "Cloudflare analytics"],
      href: "https://github.com/cephyrixzyth/Oneirodex-Website",
      linkLabel: "See website repo",
      visual: "website-visual",
      mark: "WEB",
      featured: false
    },
    {
      id: "launches",
      category: "streaming",
      number: "04",
      eyebrow: "PLATFORM LAUNCHES · AT&T / VIACOM",
      title: "A thousand channels, ready to go live.",
      description: "Earlier in my career, I helped bring AT&T TV NOW and AT&T TV to market, including a 1,000+ live-channel launch and a beta rollout across 11 key markets. That work taught me how much a smooth launch depends on the handoffs people rarely see.",
      tags: ["1,000+ live channels", "11-market beta", "Launch operations"],
      href: "https://www.linkedin.com/in/chrisjrovira/",
      linkLabel: "See profile",
      visual: "launch-visual",
      mark: "LIVE",
      featured: false
    }
  ],
  stories: [
    {
      id: "roku-operations",
      shortTitle: "The work behind playback",
      eyebrow: "ROKU · CURRENT ROLE",
      title: "The quiet work between partner delivery and playback.",
      highlight: "LIVE · ON DEMAND · SVOD · AVOD",
      paragraphs: [
        "At Roku, my work sits across internal tools, partner workflows, CDN monitoring and integrations, and operational support for The Roku Channel.",
        "That work is often a chain of handoffs. My focus is on helping teams see what comes next so the experience can feel simple on the viewer’s side."
      ],
      visual: "story-art-operations",
      media: null
    },
    {
      id: "att-live-launch",
      shortTitle: "1,000+ live channels",
      eyebrow: "LAUNCH SUPPORT · AT&T TV NOW / AT&T TV",
      title: "Getting a live lineup ready for a new home.",
      highlight: "1,000+ LIVE CHANNELS · 11-MARKET BETA",
      paragraphs: [
        "I supported the AT&T TV NOW and AT&T TV launches, including a launch with more than 1,000 live channels and a beta rollout across 11 key markets.",
        "The headline was the scale. The day-to-day work was getting content, partner details, metadata, and teams aligned so a complicated lineup could arrive as one service."
      ],
      visual: "story-art-launch",
      media: null
    },
    {
      id: "regional-sports",
      shortTitle: "Regional sports rights",
      eyebrow: "METADATA · REGIONAL SPORTS NETWORKS",
      title: "Making availability travel with the schedule.",
      highlight: "SCTE 224 · RIGHTS-AWARE WORKFLOWS",
      paragraphs: [
        "I integrated SCTE 224 workflows for regional sports networks, bringing rights and availability information into the delivery process.",
        "When a game is only available in certain places or windows, that context matters as much as the video file. Getting those details into the right workflow helps partners and platforms make the experience clearer."
      ],
      visual: "story-art-sports",
      media: null
    },
    {
      id: "international-delivery",
      shortTitle: "One catalog, many destinations",
      eyebrow: "PARTNER DELIVERY · VIACOM INTERNATIONAL",
      title: "Taking digital video from the edit to more screens.",
      highlight: "VOD · DTO · SVOD · INTERNATIONAL",
      paragraphs: [
        "At Viacom International, I led digital video delivery and post-production work for transactional and subscription partners, while onboarding partners and supporting international distribution.",
        "Services in that mix included Netflix, iTunes, and Amazon. Moving from the edit suite into partner delivery taught me to keep the creative intent and the technical requirements in view at the same time."
      ],
      visual: "story-art-international",
      media: null
    },
    {
      id: "creative-roots",
      shortTitle: "From the edit bay onward",
      eyebrow: "EARLIER CREDITS · EDITING & POST",
      title: "Before the platform, there was the picture and the sound.",
      highlight: "VIDEO EDITING · AUDIO · POST-PRODUCTION",
      paragraphs: [
        "I started close to the craft—editing, audio engineering, and post-production across studio, freelance, and film work. That gave me an eye for what quality looks like and an ear for the small things a viewer notices.",
        "That creative foundation still shapes how I approach operations: delivery is part of the story, and the systems behind it should protect the work rather than get in its way."
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
      title: "Technical Operations Manager",
      dates: "Nov 2020 — Present",
      place: "Streaming platform",
      summary: "I work across the tools, partner workflows, and operational details behind The Roku Channel’s live and on-demand experiences.",
      points: ["Technical guidance on internal tools and internal / external customer support", "CDN tooling, monitoring, integrations, and partner scaling", "Incident management and on-call services for The Roku Channel"],
      current: true
    },
    {
      company: "AT&T Entertainment Group",
      title: "Integration Manager · Content & Programming Manager",
      dates: "Nov 2016 — Feb 2020",
      place: "San Diego, California",
      summary: "Managed live and on-demand services across platforms, providers, and backend systems.",
      points: ["Supported DIRECTV NOW and AT&T TV launches", "Onboarded live channels and partners", "Integrated SCTE 224 workflows for regional sports networks"],
      current: false
    },
    {
      company: "Viacom International",
      title: "Partner Manager & Supervising Editor · VOD / DTO / SVOD",
      dates: "Mar 2011 — Sep 2016",
      place: "New York, New York",
      summary: "Led digital video delivery and post-production work for transactional and subscription video partners.",
      points: ["Managed a team of editors and delivery workflows", "Onboarded partners and supported international distribution", "Worked across launches for services including Netflix, iTunes, and Amazon"],
      current: false
    },
    {
      company: "Bigfoot Entertainment",
      title: "Assistant Post Supervisor · On-line Editor",
      dates: "Mar 2010 — Jan 2011",
      place: "Cebu, Philippines",
      summary: "Worked across post-production, online editing, and audio for Bigfoot Studios.",
      points: ["Contributed to post-production on Deep Gold", "Managed editing stations and supported their editors", "Helped prepare film and sound deliverables"],
      current: false
    },
    {
      company: "Eastern Video",
      title: "Video Editor · Audio Engineer (Freelance)",
      dates: "Apr 2009 — Nov 2009",
      place: "Miami, Florida",
      summary: "Edited local commercials and prepared media for broadcast, disc, and digital delivery.",
      points: ["Edited video and created supporting graphics", "Encoded video for broadcast and tape", "Prepared DVD and Blu-ray deliverables"],
      current: false
    },
    {
      company: "Arch-Creek Pictures",
      title: "Studio Manager · Video Editor · Audio Engineer",
      dates: "Feb 2006 — Mar 2010",
      place: "Miami, Florida",
      summary: "Managed a creative production studio and its day-to-day client, asset, and post-production workflows.",
      points: ["Managed incoming clients across video and audio suites", "Edited EPKs, promos, and the web series Tom Hollands – Driven", "Created DVD, Blu-ray, and streaming deliverables; managed archives"],
      current: false
    }
  ],
  skills: ["Streaming operations", "Content delivery", "Partner integrations", "Incident management", "Media workflows", "Metadata & XML", "Agile / Scrum", "Linux", "SQL", "Video & audio post"],
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

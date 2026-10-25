import type {
  Workspace,
  WorkspaceMembership,
  Customer,
  Lead,
  Complaint,
  ComplaintNote,
  Activity,
  Purchase,
  Recommendation,
  AuditEvent,
  DashboardMetrics,
  CustomerGrowthDataPoint,
  RevenueDataPoint,
  PipelineSummary,
  LeadStage,
} from "@/types/database";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}

function hoursFromNow(n: number): string {
  return new Date(Date.now() + n * 3_600_000).toISOString();
}

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

export const WORKSPACE_ID = "ws_solez_01";
export const ADMIN_ID = "usr_sarah_solez";
export const MANAGER_ID = "usr_marcus_solez";
export const EMPLOYEE_ID = "usr_elena_solez";

export const workspace: Workspace = {
  id: WORKSPACE_ID,
  name: "Solez",
  slug: "solez",
  created_at: daysAgo(120),
  updated_at: daysAgo(1),
};

export const members: WorkspaceMembership[] = [
  {
    id: "mem_001",
    workspace_id: WORKSPACE_ID,
    user_id: ADMIN_ID,
    role: "admin",
    display_name: "Sarah Chen",
    email: "sarah@solez.store",
    created_at: daysAgo(120),
    updated_at: daysAgo(120),
  },
  {
    id: "mem_002",
    workspace_id: WORKSPACE_ID,
    user_id: MANAGER_ID,
    role: "manager",
    display_name: "Marcus Vance",
    email: "marcus@solez.store",
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
  {
    id: "mem_003",
    workspace_id: WORKSPACE_ID,
    user_id: EMPLOYEE_ID,
    role: "employee",
    display_name: "Elena Rostova",
    email: "elena@solez.store",
    created_at: daysAgo(60),
    updated_at: daysAgo(60),
  },
];

// 3 Customer Accounts for Solez Shoe Store (Direct-to-Consumer Sneaker Shoppers)
export const customers: Customer[] = [
  // Customer 1: VIP Sneakerhead with Repeat Quality Issues (High Churn Risk)
  {
    id: "cust_001",
    workspace_id: WORKSPACE_ID,
    name: "Marcus Brody",
    email: "marcus.brody@gmail.com",
    phone: "+1 (555) 345-6789",
    status: "active",
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    tags: ["sneakerhead", "vip-member", "marathoner"],
    importance: 5,
    health_score: 28,
    health_band: "critical",
    health_signals: [
      "2 repeated complaints on sole quality in 30 days",
      "Negative sentiment: threatens to stop buying Solez footwear",
      "Holding $350 customized race pre-order",
    ],
    notes: "VIP sneaker club member & runner. Experiencing repeat sole detachment on Strider High-Tops. High churn risk.",
    created_at: daysAgo(95),
    updated_at: daysAgo(1),
    last_activity_at: hoursAgo(3),
    total_purchases: 4,
    total_revenue: 1450,
    open_complaints_count: 2,
  },

  // Customer 2: Marathon & Trail Runner
  {
    id: "cust_002",
    workspace_id: WORKSPACE_ID,
    name: "Elena Gilbert",
    email: "elena.gilbert@outlook.com",
    phone: "+1 (555) 456-7890",
    status: "active",
    owner_id: MANAGER_ID,
    owner_name: "Marcus Vance",
    tags: ["marathon", "trail-runner", "loyal"],
    importance: 4,
    health_score: 68,
    health_band: "at-risk",
    health_signals: [
      "Size exchange fulfillment delay",
      "One active order dispute pending replacement tracking",
    ],
    notes: "Avid long-distance runner. Ordered CarbonPro racing trainers for upcoming marathon.",
    created_at: daysAgo(75),
    updated_at: daysAgo(2),
    last_activity_at: daysAgo(1),
    total_purchases: 2,
    total_revenue: 480,
    open_complaints_count: 1,
  },

  // Customer 3: Everyday Lifestyle & Comfort Walker (Healthy Account)
  {
    id: "cust_003",
    workspace_id: WORKSPACE_ID,
    name: "Paul Zimmerman",
    email: "paul.zimmerman@yahoo.com",
    phone: "+1 (555) 234-5678",
    status: "active",
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    tags: ["lifestyle", "repeat-buyer", "daily-walker"],
    importance: 5,
    health_score: 91,
    health_band: "healthy",
    health_signals: [
      "Consistent seasonal buyer",
      "Minor freight box packaging issue resolved in under 24 hours",
      "Interested in upcoming WinterBoot collection",
    ],
    notes: "Loyal casual footwear customer. Very satisfied with AeroWalk daily comfort sneakers.",
    created_at: daysAgo(110),
    updated_at: daysAgo(2),
    last_activity_at: daysAgo(2),
    total_purchases: 3,
    total_revenue: 720,
    open_complaints_count: 0,
  },

  // Customer 4: High School Track & Cross-Country Coach (Bulk Buyer)
  {
    id: "cust_004",
    workspace_id: WORKSPACE_ID,
    name: "Chloe Bennett",
    email: "chloe.bennett@gmail.com",
    phone: "+1 (555) 789-0123",
    status: "active",
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    tags: ["track-coach", "bulk-order", "high-volume"],
    importance: 5,
    health_score: 96,
    health_band: "healthy",
    health_signals: [
      "Head coach for Lincoln High Cross-Country",
      "Requested team bulk sizing order for 12 varsity runners",
      "Awaiting school athletic budget authorization",
    ],
    notes: "Head cross-country coach. Organizing bulk team order of 12 pairs of CarbonPro racing trainers for regional championship.",
    created_at: daysAgo(40),
    updated_at: daysAgo(1),
    last_activity_at: hoursAgo(4),
    total_purchases: 1,
    total_revenue: 350,
    open_complaints_count: 0,
  },

  // Customer 5: Fashion Photographer & Bespoke Sneaker Buyer
  {
    id: "cust_005",
    workspace_id: WORKSPACE_ID,
    name: "Liam Vance",
    email: "liam.vance@yahoo.com",
    phone: "+1 (555) 890-1234",
    status: "active",
    owner_id: MANAGER_ID,
    owner_name: "Marcus Vance",
    tags: ["bespoke", "custom-design", "wedding"],
    importance: 4,
    health_score: 89,
    health_band: "healthy",
    health_signals: [
      "Wedding scheduled in November",
      "Submitted custom gold heel embroidery mockups",
      "Approved leather swatch sample kit",
    ],
    notes: "Photographer ordering custom-embroidered Solez Strider High-Tops for himself and his wedding groomsmen.",
    created_at: daysAgo(30),
    updated_at: daysAgo(2),
    last_activity_at: daysAgo(1),
    total_purchases: 1,
    total_revenue: 220,
    open_complaints_count: 0,
  },
];

export const leads: Lead[] = [
  // Lead 1: Limited Edition Sneaker Drop (Held up by Complaint)
  {
    id: "lead_002",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_001",
    customer_name: "Marcus Brody",
    contact_name: "Marcus Brody",
    contact_email: "marcus.brody@gmail.com",
    lead_type: "Limited Sneaker Drop Reservation",
    source: "VIP Sneakerhead Drop Club",
    value: 350,
    stage: "negotiation",
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    expected_close_date: daysFromNow(5),
    notes: "Holiday street-edition drop reservation for CarbonStrider Pro. Marcus is withholding checkout payment until his repeat sole delamination warranty issue is fully resolved.",
    created_at: daysAgo(25),
    updated_at: daysAgo(1),
  },

  // Lead 2: Bulk Track Team Order (High Value Opportunity)
  {
    id: "lead_003",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_004",
    customer_name: "Chloe Bennett",
    contact_name: "Chloe Bennett",
    contact_email: "chloe.bennett@gmail.com",
    lead_type: "Bulk Track Team Order",
    source: "High School Athletics Program",
    value: 1850,
    stage: "proposal",
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    expected_close_date: daysFromNow(8),
    notes: "Bulk team order for 12 pairs of CarbonPro distance racing shoes for high school cross-country varsity squad. Sizing sheet confirmed, awaiting athletic booster budget sign-off.",
    created_at: daysAgo(12),
    updated_at: hoursAgo(4),
  },

  // Lead 3: Custom Bespoke Sneaker Build (High Margin Craftsmanship)
  {
    id: "lead_004",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_005",
    customer_name: "Liam Vance",
    contact_name: "Liam Vance",
    contact_email: "liam.vance@yahoo.com",
    lead_type: "Custom Bespoke Sneaker Build",
    source: "Custom Wedding Shoes Inquiry",
    value: 480,
    stage: "qualified",
    owner_id: MANAGER_ID,
    owner_name: "Marcus Vance",
    expected_close_date: daysFromNow(14),
    notes: "Customer wants custom cream leather Strider High-Tops with monogrammed gold heel stitching for his wedding. Swatch samples approved; confirming sole colorway.",
    created_at: daysAgo(6),
    updated_at: daysAgo(1),
  },

  // Lead 4: Seasonal Boot Pre-Order
  {
    id: "lead_001",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_003",
    customer_name: "Paul Zimmerman",
    contact_name: "Paul Zimmerman",
    contact_email: "paul.zimmerman@yahoo.com",
    lead_type: "Seasonal Boot Pre-Order",
    source: "WinterBoot Drop VIP List",
    value: 320,
    stage: "new",
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    expected_close_date: daysFromNow(10),
    notes: "VIP reservation for 2 pairs of Solez AeroWalk Waterproof Winter edition. Early-bird discount code sent via SMS.",
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
  },

  // Lead 5: Marathon Recovery Slide Pre-Order (Won Deal)
  {
    id: "lead_005",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_002",
    customer_name: "Elena Gilbert",
    contact_name: "Elena Gilbert",
    contact_email: "elena.gilbert@outlook.com",
    lead_type: "Marathon Recovery Slide Pre-Order",
    source: "Post-Race VIP Loyalty Email",
    value: 120,
    stage: "won",
    owner_id: MANAGER_ID,
    owner_name: "Marcus Vance",
    expected_close_date: daysAgo(2),
    notes: "Elena purchased 2 pairs of AeroCloud Recovery Slides after her sizing exchange issue was resolved. Successfully paid and fulfilled!",
    created_at: daysAgo(15),
    updated_at: daysAgo(2),
  },
];

// 5 Complaints across the 3 customers, including 2 repeat complaints for Marcus Brody to test algorithm
export const complaints: Complaint[] = [
  // Complaint 1: Repeat Issue #1 on Marcus Brody (High Severity & Negative Sentiment)
  {
    id: "comp_001",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_001",
    customer_name: "Marcus Brody",
    customer_email: "marcus.brody@gmail.com",
    title: "REPEAT DEFECT: Outsole delamination on Solez Strider High-Tops (Order #SZ-4821)",
    description: "This is the second pair of Strider High-Tops in 30 days where the rubber outsole separated from the heel during my daily run. The replacement pair did the exact same thing within a week! I have been a loyal Solez customer, but this repeated failure is unacceptable. If Solez cannot guarantee proper adhesive quality, I will stop buying Solez footwear and switch to another brand.",
    status: "in_progress",
    severity: 5,
    sentiment: "negative",
    sentiment_confidence: 0.96,
    sentiment_explanation: "Detected critical recurrence keywords ('second pair in 30 days', 'repeated failure', 'stop buying Solez', 'switch to another brand') showing severe customer churn risk.",
    priority_score: 98,
    priority_reasons: [
      "Critical Severity (5/5)",
      "Repeat complaint trigger: second delamination failure in 30 days",
      "Strong negative churn sentiment detected",
      "Customer holds pending $350 limited-drop reservation",
      "SLA expiring in under 2 hours",
    ],
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    sla_due_at: hoursFromNow(2),
    created_at: hoursAgo(10),
    updated_at: hoursAgo(1),
  },

  // Complaint 2: Repeat Issue #2 on Marcus Brody (Prior Delamination Complaint from 2 Weeks Ago)
  {
    id: "comp_002",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_001",
    customer_name: "Marcus Brody",
    customer_email: "marcus.brody@gmail.com",
    title: "Sole separation at toe box on initial pair",
    description: "The rubber sole began peeling off at the toe box after just three runs. Please send a replacement pair.",
    status: "waiting",
    severity: 4,
    sentiment: "negative",
    sentiment_confidence: 0.88,
    sentiment_explanation: "Frustrated customer noting factory adhesive defect on initial pair.",
    priority_score: 82,
    priority_reasons: [
      "High Severity (4/5)",
      "Initial occurrence of outsole adhesive defect",
      "VIP sneakerhead member",
    ],
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    sla_due_at: hoursFromNow(18),
    created_at: daysAgo(16),
    updated_at: daysAgo(5),
  },

  // Complaint 3: Elena Gilbert (Fulfillment / Sizing Error)
  {
    id: "comp_003",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_002",
    customer_name: "Elena Gilbert",
    customer_email: "elena.gilbert@outlook.com",
    title: "Wrong shoe sizing received: Sent Men's 10.5 instead of Women's 8.5",
    description: "I ordered Women's size 8.5 CarbonPro trainers for my half-marathon race next week. The box arrived with Men's size 10.5 wide. The race is in 10 days, so I need expedited replacement pairs shipped overnight.",
    status: "in_progress",
    severity: 3,
    sentiment: "neutral",
    sentiment_confidence: 0.82,
    sentiment_explanation: "Time-sensitive fulfillment mix-up with upcoming competition race deadline.",
    priority_score: 65,
    priority_reasons: [
      "Severity 3/5 with race deadline constraint",
      "VIP marathon runner",
      "SLA due in 24 hours",
    ],
    owner_id: MANAGER_ID,
    owner_name: "Marcus Vance",
    sla_due_at: hoursFromNow(22),
    created_at: hoursAgo(18),
    updated_at: hoursAgo(2),
  },

  // Complaint 4: Paul Zimmerman (Freight Packaging Damage)
  {
    id: "comp_004",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_003",
    customer_name: "Paul Zimmerman",
    customer_email: "paul.zimmerman@yahoo.com",
    title: "Crushed shoe box on delivery (Order #SZ-3310)",
    description: "Courier left the parcel in the rain and the outer shoe box was crushed. The shoes inside are intact, but I collect the limited boxes. Requesting a replacement box or small store voucher.",
    status: "resolved",
    severity: 2,
    sentiment: "neutral",
    sentiment_confidence: 0.85,
    sentiment_explanation: "Objective delivery claim with intact footwear.",
    priority_score: 30,
    priority_reasons: [
      "Low Severity (2/5) — cosmetic box packaging only",
      "Replacement collector shoe box dispatched via FedEx",
      "Ticket successfully resolved",
    ],
    owner_id: ADMIN_ID,
    owner_name: "Sarah Chen",
    sla_due_at: daysAgo(2),
    resolved_at: daysAgo(1),
    created_at: daysAgo(4),
    updated_at: daysAgo(1),
  },

  // Complaint 5: Elena Gilbert (Product Design & Arch Support Feedback)
  {
    id: "comp_005",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_002",
    customer_name: "Elena Gilbert",
    customer_email: "elena.gilbert@outlook.com",
    title: "Insole arch support feedback on AeroGlide v1",
    description: "The stock foam insoles on the AeroGlide v1 compress too quickly after 15 miles. Midsole cushioning is otherwise fantastic! Wanted to pass this feedback along to your shoe design team.",
    status: "resolved",
    severity: 1,
    sentiment: "positive",
    sentiment_confidence: 0.92,
    sentiment_explanation: "Constructive runner community feedback praising midsole performance.",
    priority_score: 15,
    priority_reasons: [
      "Constructive product feedback",
      "Positive sentiment",
      "Shared with footwear R&D team",
    ],
    owner_id: MANAGER_ID,
    owner_name: "Marcus Vance",
    sla_due_at: daysAgo(8),
    resolved_at: daysAgo(7),
    created_at: daysAgo(10),
    updated_at: daysAgo(7),
  },
];

export const complaintNotes: ComplaintNote[] = [
  {
    id: "note_001",
    complaint_id: "comp_001",
    author_id: ADMIN_ID,
    author_name: "Sarah Chen",
    content: "CRITICAL REPEAT INVESTIGATION: Contacted manufacturing line supervisor. Production line #2 had an adhesive cure temperature calibration error on batch SZ-402. Dispatched an hand-inspected replacement pair via priority courier and issued a $50 store credit for Marcus Brody.",
    is_internal: true,
    created_at: hoursAgo(2),
  },
  {
    id: "note_002",
    complaint_id: "comp_003",
    author_id: MANAGER_ID,
    author_name: "Marcus Vance",
    content: "Pulled warehouse picking logs. Bin label was inverted. Prepared Women's size 8.5 with overnight priority courier tracking #SZ-OVERNIGHT-991 for Elena Gilbert.",
    is_internal: true,
    created_at: hoursAgo(1),
  },
];

export const activities: Activity[] = [
  {
    id: "act_001",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_001",
    type: "call",
    title: "Customer Support Resolution Call",
    description: "Personal call with Marcus Brody addressing repeat sole failure; offered hand-inspected replacement pair and $50 store credit.",
    performed_by: ADMIN_ID,
    performer_name: "Sarah Chen",
    created_at: hoursAgo(2),
  },
  {
    id: "act_002",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_002",
    type: "email",
    title: "Overnight Size Replacement Shipped",
    description: "Sent overnight tracking number for Women's 8.5 CarbonPro trainers to Elena Gilbert.",
    performed_by: MANAGER_ID,
    performer_name: "Marcus Vance",
    created_at: hoursAgo(1),
  },
  {
    id: "act_003",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_003",
    type: "meeting",
    title: "Winter Shoe Line Consultation",
    description: "Shared WinterBoot collection preview with Paul Zimmerman. Highly interested in the waterproof editions.",
    performed_by: ADMIN_ID,
    performer_name: "Sarah Chen",
    created_at: daysAgo(2),
  },
];

export const purchases: Purchase[] = [
  {
    id: "pur_001",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_003",
    amount: 180,
    description: "Solez AeroWalk Daily Sneakers (Men's 10)",
    purchased_at: daysAgo(60),
    created_at: daysAgo(60),
  },
  {
    id: "pur_002",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_003",
    amount: 240,
    description: "Summer Comfort Sandals & Orthotic Insoles",
    purchased_at: daysAgo(25),
    created_at: daysAgo(25),
  },
  {
    id: "pur_003",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_001",
    amount: 450,
    description: "Strider High-Top Street Edition (2 pairs)",
    purchased_at: daysAgo(50),
    created_at: daysAgo(50),
  },
  {
    id: "pur_004",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_001",
    amount: 350,
    description: "Solez Canvas Low-Top Limited Edition",
    purchased_at: daysAgo(80),
    created_at: daysAgo(80),
  },
  {
    id: "pur_005",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_002",
    amount: 260,
    description: "CarbonPro Distance Racing Shoes (Women's 8.5)",
    purchased_at: daysAgo(20),
    created_at: daysAgo(20),
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "rec_001",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_001",
    customer_name: "Marcus Brody",
    complaint_id: "comp_001",
    type: "respond_complaint",
    title: "URGENT SLA & CHURN: Resolve repeat sole detachment for Marcus Brody",
    reason: "Algorithm detected a REPEAT quality defect within 30 days. Customer threatened to switch to a rival brand and holds a pending $350 drop reservation. SLA due in under 2 hours.",
    priority: "urgent",
    status: "pending",
    assigned_to: ADMIN_ID,
    assigned_to_name: "Sarah Chen",
    due_date: hoursFromNow(2),
    created_at: hoursAgo(8),
    updated_at: hoursAgo(1),
  },
  {
    id: "rec_002",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_002",
    customer_name: "Elena Gilbert",
    complaint_id: "comp_003",
    type: "check_in",
    title: "Confirm delivery of overnight replacement sizes for Elena Gilbert",
    reason: "Half-marathon race is in 10 days. Ensure replacement shipment was delivered without further delay.",
    priority: "high",
    status: "pending",
    assigned_to: MANAGER_ID,
    assigned_to_name: "Marcus Vance",
    due_date: daysFromNow(1),
    created_at: hoursAgo(12),
    updated_at: hoursAgo(1),
  },
  {
    id: "rec_003",
    workspace_id: WORKSPACE_ID,
    customer_id: "cust_003",
    customer_name: "Paul Zimmerman",
    lead_id: "lead_001",
    type: "follow_up_lead",
    title: "Finalize WinterBoot Pre-order with Paul Zimmerman ($320)",
    reason: "Customer account is in healthy standing (91/100). Packaging issue was resolved yesterday. Follow up to confirm the 2-pair pre-order reservation.",
    priority: "medium",
    status: "pending",
    assigned_to: ADMIN_ID,
    assigned_to_name: "Sarah Chen",
    due_date: daysFromNow(4),
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
];

export const auditEvents: AuditEvent[] = [
  {
    id: "aud_001",
    workspace_id: WORKSPACE_ID,
    user_id: ADMIN_ID,
    user_name: "Sarah Chen",
    action: "complaint.status_updated",
    entity_type: "complaint",
    entity_id: "comp_001",
    details: { from: "new", to: "in_progress", note: "Factory adhesive audit initiated" },
    created_at: hoursAgo(2),
  },
  {
    id: "aud_002",
    workspace_id: WORKSPACE_ID,
    user_id: ADMIN_ID,
    user_name: "Sarah Chen",
    action: "complaint.resolved",
    entity_type: "complaint",
    entity_id: "comp_004",
    details: { status: "resolved", outcome: "Replacement boxes shipped" },
    created_at: daysAgo(1),
  },
];

export const demoData = {
  workspace,
  members,
  customers,
  leads,
  complaints,
  complaintNotes,
  activities,
  purchases,
  recommendations,
  importJobs: [],
  auditEvents,
};

export function getDemoDashboardMetrics(): DashboardMetrics {
  const activeCustomers = customers.filter((c) => c.status === "active");
  const churnedCustomers = customers.filter((c) => c.status === "churned");
  const churnRisk = customers.filter((c) => c.health_band === "at-risk" || c.health_band === "critical");
  const openLeads = leads.filter((l) => !["won", "lost"].includes(l.stage));
  const openComplaints = complaints.filter((c) => c.status !== "resolved");
  const overdueComplaints = complaints.filter(
    (c) => c.status !== "resolved" && c.sla_due_at && new Date(c.sla_due_at).getTime() < (typeof window !== "undefined" ? Date.now() : 1700000000000)
  );
  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalCustomers: customers.length,
    newCustomersThisMonth: 1,
    retentionRate: 100,
    churnRiskCount: churnRisk.length,
    openPipelineValue: openLeads.reduce((sum, l) => sum + l.value, 0),
    leadConversionRate: 75,
    openComplaints: openComplaints.length,
    overdueComplaints: overdueComplaints.length,
    avgResolutionTimeHours: 12,
    totalRevenue,
    revenueThisMonth: 1240,
  };
}

export function getDemoCustomerGrowth(): CustomerGrowthDataPoint[] {
  return [
    { date: "May", customers: 1, newCustomers: 1 },
    { date: "Jun", customers: 2, newCustomers: 1 },
    { date: "Jul", customers: 2, newCustomers: 0 },
    { date: "Aug", customers: 3, newCustomers: 1 },
    { date: "Sep", customers: 3, newCustomers: 0 },
    { date: "Oct", customers: 3, newCustomers: 0 },
  ];
}

export function getDemoRevenueData(): RevenueDataPoint[] {
  return [
    { date: "May", revenue: 840 },
    { date: "Jun", revenue: 1120 },
    { date: "Jul", revenue: 1350 },
    { date: "Aug", revenue: 980 },
    { date: "Sep", revenue: 1450 },
    { date: "Oct", revenue: 1980 },
  ];
}

export function getDemoPipelineSummary(): PipelineSummary[] {
  const stages: LeadStage[] = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
  return stages.map((stage) => {
    const stageLeads = leads.filter((l) => l.stage === stage);
    return {
      stage,
      count: stageLeads.length,
      value: stageLeads.reduce((sum, l) => sum + l.value, 0),
    };
  });
}

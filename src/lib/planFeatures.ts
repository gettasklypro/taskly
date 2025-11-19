export const PLAN_FEATURES = {
  basic: {
    maxSites: 1,
    customDomain: false,
    advancedTemplates: false,
  },
  pro: {
    maxSites: 10,
    customDomain: true,
    advancedTemplates: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_FEATURES;

export function isPro(planType?: string | null): boolean {
  return planType === "pro";
}

export function getPlanFeatures(planType?: string | null) {
  return PLAN_FEATURES[planType as PlanType] || PLAN_FEATURES.basic;
}

export async function handleRealUpgrade() {
  console.log("TODO: connect to Stripe billing later");
  // Future Stripe integration will go here
}

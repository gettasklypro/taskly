-- Fix Professional Electricians template structure
UPDATE templates 
SET preview_data = '[
  {
    "type": "navigation",
    "logo": "PowerUp Electric",
    "items": [
      {"label": "Services", "href": "#services"},
      {"label": "About", "href": "#about"},
      {"label": "Safety", "href": "#safety"},
      {"label": "Contact", "href": "#contact"}
    ]
  },
  {
    "type": "hero",
    "heading": "Licensed Electrical Services",
    "subheading": "Safe, reliable electrical solutions for homes and businesses",
    "content": "Certified electricians providing top-quality service with safety as our priority",
    "backgroundImage": "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920",
    "primaryButton": {"text": "Get Quote", "href": "#contact"},
    "secondaryButton": {"text": "Our Services", "href": "#services"}
  },
  {
    "type": "about",
    "heading": "Your Trusted Electricians",
    "content": "Certified electricians providing top-quality electrical services with safety as our priority. All work is code compliant.",
    "items": [
      {"title": "Licensed & Certified", "description": "Fully licensed and certified"},
      {"title": "Code Compliant", "description": "All work meets electrical codes"},
      {"title": "Safety Inspections", "description": "Thorough safety inspections"},
      {"title": "Emergency Services", "description": "Available for emergencies"}
    ]
  },
  {
    "type": "services",
    "heading": "Electrical Services",
    "items": [
      {"title": "Installations", "description": "New electrical systems", "icon": "⚡"},
      {"title": "Repairs", "description": "Quick electrical fixes", "icon": "🔧"},
      {"title": "Upgrades", "description": "Panel and system upgrades", "icon": "⬆️"},
      {"title": "Inspections", "description": "Safety inspections", "icon": "🛡️"}
    ]
  },
  {
    "type": "split",
    "heading": "Safety First",
    "subheading": "All our work meets or exceeds electrical codes",
    "content": "We prioritize your safety in every job with code compliant installations and thorough inspections",
    "image": "https://images.unsplash.com/photo-1591358914969-467b2be52737?w=800"
  },
  {
    "type": "stats",
    "heading": "Our Experience",
    "items": [
      {"stat": "5000+", "title": "Jobs Completed"},
      {"stat": "18", "title": "Years Experience"},
      {"stat": "100%", "title": "Code Compliant"},
      {"stat": "24/7", "title": "Emergency Service"}
    ]
  },
  {
    "type": "content",
    "heading": "Need an Electrician?",
    "subheading": "Get professional electrical service you can trust",
    "content": "Schedule service today and experience the difference professional electrical work makes."
  },
  {
    "type": "form",
    "heading": "Request Service",
    "subheading": "Get in touch for a free estimate",
    "items": [
      {"label": "Name", "type": "text", "required": true, "placeholder": "Your name"},
      {"label": "Email", "type": "email", "required": true, "placeholder": "your@email.com"},
      {"label": "Phone", "type": "tel", "required": true, "placeholder": "(555) 123-4567"},
      {"label": "Service Details", "type": "textarea", "required": true, "placeholder": "What electrical work do you need?"}
    ]
  }
]'::jsonb
WHERE name = 'Professional Electricians';
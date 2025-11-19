-- Fix Professional Plumbers template structure
UPDATE templates 
SET preview_data = '[
  {
    "type": "navigation",
    "logo": "FlowPro Plumbing",
    "items": [
      {"label": "Services", "href": "#services"},
      {"label": "Emergency", "href": "#emergency"},
      {"label": "About", "href": "#about"},
      {"label": "Contact", "href": "#contact"}
    ]
  },
  {
    "type": "hero",
    "heading": "24/7 Emergency Plumbing Services",
    "subheading": "Fast, reliable plumbing solutions for your home and business",
    "content": "Licensed plumbers ready to help with upfront pricing and guaranteed work",
    "backgroundImage": "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1920",
    "primaryButton": {"text": "Call Now", "href": "#contact"},
    "secondaryButton": {"text": "Our Services", "href": "#services"}
  },
  {
    "type": "about",
    "heading": "Why Choose FlowPro",
    "content": "Experienced plumbers delivering quality service with upfront pricing and guaranteed work. Available 24/7 for emergencies.",
    "items": [
      {"title": "24/7 Emergency", "description": "Available around the clock"},
      {"title": "Licensed & Certified", "description": "Fully licensed and certified"},
      {"title": "Upfront Pricing", "description": "No hidden fees or surprises"},
      {"title": "Same-Day Service", "description": "Fast response times"}
    ]
  },
  {
    "type": "services",
    "heading": "Plumbing Services",
    "items": [
      {"title": "Leak Repairs", "description": "Quick leak detection and repair", "icon": "💧"},
      {"title": "Drain Cleaning", "description": "Professional drain services", "icon": "♻️"},
      {"title": "Water Heaters", "description": "Installation and repair", "icon": "🔥"},
      {"title": "Pipe Installation", "description": "New pipe systems", "icon": "🔧"}
    ]
  },
  {
    "type": "split",
    "heading": "Emergency Plumbing",
    "subheading": "Plumbing emergencies don''t wait. Neither do we.",
    "content": "Call us 24/7 for immediate assistance with any plumbing emergency",
    "image": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800"
  },
  {
    "type": "stats",
    "heading": "Our Experience",
    "items": [
      {"stat": "3000+", "title": "Jobs Completed"},
      {"stat": "15", "title": "Years Experience"},
      {"stat": "24/7", "title": "Emergency Service"},
      {"stat": "100%", "title": "Satisfaction"}
    ]
  },
  {
    "type": "content",
    "heading": "Need a Plumber Now?",
    "subheading": "Don''t let plumbing problems get worse",
    "content": "Contact us today for fast, reliable plumbing service you can trust."
  },
  {
    "type": "form",
    "heading": "Contact Us",
    "subheading": "Schedule service or request emergency help",
    "items": [
      {"label": "Name", "type": "text", "required": true, "placeholder": "Your name"},
      {"label": "Email", "type": "email", "required": true, "placeholder": "your@email.com"},
      {"label": "Phone", "type": "tel", "required": true, "placeholder": "(555) 123-4567"},
      {"label": "Service Needed", "type": "textarea", "required": true, "placeholder": "Describe the issue"}
    ]
  }
]'::jsonb
WHERE name = 'Professional Plumbers';
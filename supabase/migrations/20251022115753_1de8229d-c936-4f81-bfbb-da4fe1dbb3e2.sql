-- Fix Professional Cleaners template structure
UPDATE templates 
SET preview_data = '[
  {
    "type": "navigation",
    "logo": "CleanPro",
    "items": [
      {"label": "Services", "href": "#services"},
      {"label": "About", "href": "#about"},
      {"label": "Testimonials", "href": "#testimonials"},
      {"label": "Contact", "href": "#contact"}
    ]
  },
  {
    "type": "hero",
    "heading": "Sparkling Clean Homes & Offices",
    "subheading": "Professional cleaning services you can trust",
    "content": "We make your space shine with eco-friendly products and expert care",
    "backgroundImage": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920",
    "primaryButton": {"text": "Book Now", "href": "#contact"},
    "secondaryButton": {"text": "Our Services", "href": "#services"}
  },
  {
    "type": "about",
    "heading": "Why Choose Us",
    "content": "With over 10 years of experience, we deliver exceptional cleaning services with attention to detail and customer satisfaction.",
    "items": [
      {"title": "Eco-friendly", "description": "Using only eco-friendly cleaning products"},
      {"title": "Insured & Bonded", "description": "Fully insured and bonded for your peace of mind"},
      {"title": "Flexible Scheduling", "description": "We work around your schedule"},
      {"title": "100% Guarantee", "description": "Satisfaction guaranteed or we return"}
    ]
  },
  {
    "type": "services",
    "heading": "Our Services",
    "items": [
      {"title": "Residential Cleaning", "description": "Deep cleaning for homes", "icon": "✨"},
      {"title": "Office Cleaning", "description": "Commercial cleaning solutions", "icon": "🏢"},
      {"title": "Move In/Out", "description": "Complete cleaning for moving", "icon": "🚚"},
      {"title": "Deep Cleaning", "description": "Thorough cleaning service", "icon": "💎"}
    ]
  },
  {
    "type": "stats",
    "heading": "Our Track Record",
    "items": [
      {"stat": "2500+", "title": "Happy Clients"},
      {"stat": "15", "title": "Years Experience"},
      {"stat": "98%", "title": "Satisfaction Rate"},
      {"stat": "24/7", "title": "Support"}
    ]
  },
  {
    "type": "testimonials",
    "heading": "What Our Clients Say",
    "items": [
      {"name": "Sarah Johnson", "text": "Best cleaning service ever! My home has never looked better.", "rating": 5},
      {"name": "Mike Brown", "text": "Professional, reliable, and thorough. Highly recommend!", "rating": 5}
    ]
  },
  {
    "type": "content",
    "heading": "Ready for a Cleaner Space?",
    "subheading": "Book your cleaning service today and experience the difference",
    "content": "Get a free quote and see why thousands of customers trust us with their homes and offices."
  },
  {
    "type": "form",
    "heading": "Contact Us",
    "subheading": "Get in touch for a free quote",
    "items": [
      {"label": "Name", "type": "text", "required": true, "placeholder": "Your name"},
      {"label": "Email", "type": "email", "required": true, "placeholder": "your@email.com"},
      {"label": "Phone", "type": "tel", "required": false, "placeholder": "(555) 123-4567"},
      {"label": "Message", "type": "textarea", "required": true, "placeholder": "Tell us about your cleaning needs"}
    ]
  }
]'::jsonb
WHERE name = 'Professional Cleaners';
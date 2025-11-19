-- Fix Professional Builders template structure
UPDATE templates 
SET preview_data = '[
  {
    "type": "navigation",
    "logo": "BuildRight",
    "items": [
      {"label": "Projects", "href": "#projects"},
      {"label": "Services", "href": "#services"},
      {"label": "About", "href": "#about"},
      {"label": "Contact", "href": "#contact"}
    ]
  },
  {
    "type": "hero",
    "heading": "Building Dreams Into Reality",
    "subheading": "Expert construction services for residential and commercial projects",
    "content": "Quality builds on time and within budget with 20+ years of experience",
    "backgroundImage": "https://images.unsplash.com/photo-1541976590-713941681591?w=1920",
    "primaryButton": {"text": "View Projects", "href": "#projects"},
    "secondaryButton": {"text": "Get Estimate", "href": "#contact"}
  },
  {
    "type": "about",
    "heading": "About Our Company",
    "content": "With 20+ years in construction, we deliver quality builds on time and within budget. Our experienced team brings your vision to life.",
    "items": [
      {"title": "Licensed Contractors", "description": "Fully licensed and insured contractors"},
      {"title": "Quality Craft", "description": "Exceptional craftsmanship on every project"},
      {"title": "Transparent Pricing", "description": "No hidden fees or surprises"},
      {"title": "Project Management", "description": "Expert project management expertise"}
    ]
  },
  {
    "type": "services",
    "heading": "Our Services",
    "items": [
      {"title": "Home Building", "description": "Custom home construction", "icon": "🏠"},
      {"title": "Renovations", "description": "Remodeling and upgrades", "icon": "🔨"},
      {"title": "Commercial", "description": "Business construction", "icon": "🏢"},
      {"title": "Additions", "description": "Home extensions", "icon": "➕"}
    ]
  },
  {
    "type": "gallery",
    "heading": "Recent Projects",
    "items": [
      {"title": "Modern Family Home", "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"},
      {"title": "Office Complex", "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"},
      {"title": "Kitchen Renovation", "image": "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800"}
    ]
  },
  {
    "type": "stats",
    "heading": "Our Numbers",
    "items": [
      {"stat": "500+", "title": "Projects Completed"},
      {"stat": "20+", "title": "Years Experience"},
      {"stat": "100%", "title": "Licensed & Insured"},
      {"stat": "50+", "title": "Expert Team"}
    ]
  },
  {
    "type": "content",
    "heading": "Start Your Project Today",
    "subheading": "Let us bring your vision to life with expert craftsmanship",
    "content": "Contact us for a free estimate and consultation on your next construction project."
  },
  {
    "type": "form",
    "heading": "Request a Quote",
    "subheading": "Tell us about your project",
    "items": [
      {"label": "Name", "type": "text", "required": true, "placeholder": "Your name"},
      {"label": "Email", "type": "email", "required": true, "placeholder": "your@email.com"},
      {"label": "Phone", "type": "tel", "required": false, "placeholder": "(555) 123-4567"},
      {"label": "Project Details", "type": "textarea", "required": true, "placeholder": "Describe your project"}
    ]
  }
]'::jsonb
WHERE name = 'Professional Builders';
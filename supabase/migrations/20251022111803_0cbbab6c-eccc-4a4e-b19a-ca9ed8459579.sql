-- Update Business Coach Elite template (id: 0aa29646-4541-499a-9a5e-20e79201833b)
UPDATE templates 
SET preview_data = $BODY$[
  {
    "type": "navigation",
    "logo": "CoachElite Pro",
    "items": [
      {"label": "Home", "href": "#home"},
      {"label": "About", "href": "#about"},
      {"label": "Services", "href": "#services"},
      {"label": "Success Stories", "href": "#testimonials"},
      {"label": "Contact", "href": "#contact"}
    ]
  },
  {
    "type": "hero",
    "heading": "Unlock Your Full Business Potential",
    "subheading": "Transform your business with proven coaching strategies from industry experts",
    "content": "Partner with experienced business coaches who have helped hundreds of entrepreneurs and executives achieve breakthrough results.",
    "backgroundImage": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
    "primaryButton": {"text": "Book Free Consultation", "href": "#contact"},
    "secondaryButton": {"text": "Our Approach", "href": "#about"}
  },
  {
    "type": "about",
    "heading": "Empowering Leaders Since 2010",
    "subheading": "Excellence Through Experience",
    "content": "We are a team of certified business coaches with over 15 years of combined experience helping businesses scale, optimize operations, and achieve sustainable growth. Our proven methodology has transformed over 500 businesses across various industries.",
    "image": "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80"
  },
  {
    "type": "stats",
    "heading": "Our Impact in Numbers",
    "items": [
      {"value": "500+", "label": "Businesses Coached"},
      {"value": "95%", "label": "Client Satisfaction"},
      {"value": "300%", "label": "Avg Revenue Growth"},
      {"value": "15", "label": "Years Experience"}
    ]
  },
  {
    "type": "services",
    "heading": "Comprehensive Coaching Services",
    "subheading": "Tailored solutions to accelerate your business growth",
    "items": [
      {"icon": "Target", "title": "Strategic Planning", "description": "Develop clear, actionable strategies aligned with your business vision and market opportunities."},
      {"icon": "TrendingUp", "title": "Leadership Development", "description": "Build strong leadership skills to inspire teams and drive organizational excellence."},
      {"icon": "Users", "title": "Team Performance", "description": "Optimize team dynamics and productivity through proven management frameworks."},
      {"icon": "Zap", "title": "Sales & Marketing", "description": "Implement winning sales strategies and marketing campaigns that convert."},
      {"icon": "Trophy", "title": "Financial Optimization", "description": "Master financial management and create sustainable profitability models."},
      {"icon": "Sparkles", "title": "Personal Growth", "description": "Develop mindset and habits of highly successful entrepreneurs and executives."}
    ]
  },
  {
    "type": "testimonials",
    "heading": "Success Stories from Our Clients",
    "items": [
      {"quote": "Working with CoachElite transformed my business. Revenue increased 250% in just 18 months!", "author": "Sarah Johnson", "role": "CEO, TechStart Inc.", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80"},
      {"quote": "The strategic guidance helped us navigate our toughest challenges and emerge stronger than ever.", "author": "Michael Chen", "role": "Founder, GreenTech Solutions", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"},
      {"quote": "Best investment I made for my business. The ROI has been phenomenal and continues to grow.", "author": "Jennifer Rodriguez", "role": "Owner, Fashion Boutique", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"}
    ]
  },
  {
    "type": "cta",
    "heading": "Ready to Transform Your Business?",
    "content": "Schedule a complimentary 30-minute consultation to discuss your goals and discover how our coaching can accelerate your success.",
    "buttons": [{"text": "Book Your Free Session", "variant": "secondary", "href": "#contact"}]
  },
  {
    "type": "form",
    "heading": "Get Started Today",
    "subheading": "Fill out the form and we will contact you within 24 hours",
    "fields": [
      {"name": "name", "type": "text", "label": "Full Name", "required": true},
      {"name": "email", "type": "email", "label": "Email Address", "required": true},
      {"name": "company", "type": "text", "label": "Company Name", "required": false},
      {"name": "phone", "type": "tel", "label": "Phone Number", "required": false},
      {"name": "message", "type": "textarea", "label": "Tell us about your business goals", "required": true}
    ]
  }
]$BODY$::jsonb
WHERE id = '0aa29646-4541-499a-9a5e-20e79201833b';
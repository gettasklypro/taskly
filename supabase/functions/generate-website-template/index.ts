import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge function called');
    // Log all request headers
    const allHeaders: Record<string, string> = {};
    for (const [key, value] of req.headers.entries()) {
      allHeaders[key] = value;
    }
    console.log('Request headers:', allHeaders);
    // Log raw Authorization header
    console.log('Raw Authorization header:', req.headers.get('Authorization'));

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { prompt, category, businessName, userId } = await req.json();

    // Determine the user ID - either from the request (batch mode) or from auth (normal mode)
    let effectiveUserId: string;

    if (userId) {
      // Batch mode: userId provided in request body (called with service role)
      console.log('Using provided userId from batch:', userId);
      effectiveUserId = userId;
    } else {
      // Normal mode: authenticate the user
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      console.log('getUser() result:', { user, authError });
      if (authError) {
        console.error('Auth error:', authError);
        return new Response(JSON.stringify({ error: 'Authentication failed', details: authError }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!user) {
        console.error('No user found in session');
        return new Response(JSON.stringify({ error: 'No authenticated user found' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log('User authenticated:', user.id);
      effectiveUserId = user.id;
    }
    if (!prompt || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating template for:', { prompt, category, businessName });

    // Check if prompt contains a URL and fetch website content
    let websiteContext = '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = prompt.match(urlRegex);

    if (urls && urls.length > 0) {
      const targetUrl = urls[0];
      console.log('Detected URL in prompt, fetching website content:', targetUrl);

      try {
        const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
        if (FIRECRAWL_API_KEY) {
          // Use Firecrawl to scrape the website
          const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: targetUrl,
              formats: ['markdown', 'html'],
              onlyMainContent: true
            }),
          });

          if (scrapeResponse.ok) {
            const scrapeData = await scrapeResponse.json();
            if (scrapeData.data) {
              const { markdown, metadata } = scrapeData.data;
              websiteContext = `\n\nANALYZED WEBSITE CONTENT FROM ${targetUrl}:\nTitle: ${metadata?.title || 'N/A'}\nDescription: ${metadata?.description || 'N/A'}\n\nContent Structure:\n${markdown?.substring(0, 5000) || 'N/A'}\n\nIMPORTANT: Use this website as a reference for the style, structure, tone, and content type. Generate a similar website that matches this style and purpose.`;
              console.log('Successfully scraped website content');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching website content:', error);
        // Continue without website context if scraping fails
      }
    }

    const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');

    // Helper function to fetch images from Pexels with randomization
    const fetchPexelsImage = async (query: string, size: 'large' | 'medium' = 'large'): Promise<string> => {
      try {
        console.log('Fetching Pexels image for:', query);

        // Fetch multiple images and randomly select one for diversity
        const perPage = 15;
        const randomPage = Math.floor(Math.random() * 3) + 1; // Random page between 1-3

        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${randomPage}&orientation=landscape`, {
          headers: {
            'Authorization': PEXELS_API_KEY || ''
          }
        });

        if (!response.ok) {
          console.error('Pexels API error:', response.status);
          return '';
        }

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          // Randomly select one of the fetched images for variety
          const randomIndex = Math.floor(Math.random() * data.photos.length);
          const selectedPhoto = data.photos[randomIndex];
          const imageUrl = size === 'large' ? selectedPhoto.src.large2x : selectedPhoto.src.large;
          console.log(`Pexels image fetched successfully (${randomIndex + 1} of ${data.photos.length})`);
          return imageUrl;
        }

        return '';
      } catch (error) {
        console.error('Pexels fetch error:', error);
        return '';
      }
    };

    // Generate website structure using AI
    const systemPrompt = `You are an expert website designer and copywriter. You MUST create a complete, professional website with engaging content that follows the EXACT JSON structure provided.

CRITICAL: Return ONLY valid JSON. NO markdown code blocks. NO explanations. NO extra text. Just the raw JSON object.

You MUST return this EXACT structure (all fields required):
{
  "websiteName": "string - Professional business name relevant to the category (2-5 words)",
  "description": "string - One compelling sentence describing what the business does (10-20 words)",
  "pages": [
    {
      "title": "Home",
      "slug": "/",
      "isHomepage": true,
      "sections": [
        {
          "type": "navigation",
          "items": [
            {"label": "Home", "href": "/"},
            {"label": "About", "href": "#about"},
            {"label": "Services", "href": "#what-we-offer"},
            {"label": "Projects", "href": "#recent-projects"},
            {"label": "Contact", "href": "#get-in-touch"}
          ],
          "backgroundColor": "bg-background/80",
          "textColor": "text-foreground"
        },
        {
          "type": "hero",
          "heading": "Powerful, benefit-focused headline (5-8 words)",
          "subheading": "Compelling value proposition that explains who you help and how (10-15 words)",
          "content": "Brief description expanding on the value (20-30 words)",
          "backgroundColor": "gradient-to-br from-primary to-accent",
          "textColor": "text-white",
          "image": "business professional workspace" (MUST be 2-4 word search keyword),
          "buttons": [
            {"text": "Get Started", "href": "#contact", "variant": "default"},
            {"text": "Learn More", "href": "#about", "variant": "outline"}
          ]
        },
        {
          "type": "about",
          "id": "about",
          "heading": "About Us",
          "subheading": "Short, engaging subheading",
          "content": "Detailed story that builds trust and credibility. Include mission, approach, and what makes the business unique (60-100 words)",
          "backgroundColor": "bg-background",
          "textColor": "text-foreground",
          "image": "professional team collaboration"
        },
        {
          "type": "services",
          "id": "what-we-offer",
          "heading": "Our Services" or "What We Offer",
          "subheading": "How we help you succeed",
          "backgroundColor": "bg-muted/30",
          "textColor": "text-foreground",
          "items": [
            {
              "title": "Service Name (2-4 words)",
              "description": "Clear benefit-focused description (15-20 words)",
              "icon": "Sparkles"
            }
          ] (EXACTLY 6 items with icons: Sparkles, Zap, Heart, Star, Trophy, Target)
        },
        {
          "type": "stats",
          "heading": "Proven Results",
          "backgroundColor": "bg-primary/5",
          "items": [
            {"value": "500+", "label": "Happy Clients"},
            {"value": "99%", "label": "Success Rate"},
            {"value": "10+", "label": "Years Experience"},
            {"value": "24/7", "label": "Support"}
          ] (EXACTLY 4 impressive, believable stats)
        },
        {
          "type": "projects",
          "id": "recent-projects",
          "heading": "Our Work" or "Recent Projects",
          "subheading": "Success stories from real clients",
          "backgroundColor": "bg-background",
          "items": [
            {
              "title": "Project Name (2-4 words)",
              "description": "Results-focused description (15-20 words)",
              "image": "business results success",
              "tags": ["Keyword1", "Keyword2"]
            }
          ] (EXACTLY 6 projects with varied, relevant images)
        },
        {
          "type": "testimonials",
          "heading": "What Our Clients Say",
          "backgroundColor": "bg-muted/30",
          "items": [
            {
              "quote": "Specific, believable testimonial with concrete results (20-30 words)",
              "author": "Realistic Full Name",
              "role": "Job Title, Company Name",
              "image": "professional business person"
            }
          ] (EXACTLY 3 diverse, credible testimonials)
        },
        {
          "type": "cta",
          "heading": "Ready to Get Started?",
          "content": "Clear, action-oriented call to action (15-20 words)",
          "backgroundColor": "gradient-to-r from-primary to-accent",
          "textColor": "text-white",
          "buttons": [
            {"text": "Contact Us Today", "href": "#contact", "variant": "secondary"}
          ]
        },
        {
          "type": "contact",
          "id": "get-in-touch",
          "heading": "Get In Touch",
          "subheading": "Let's discuss how we can help you",
          "content": "Professional invitation to contact (20-25 words)",
          "backgroundColor": "bg-background",
          "textColor": "text-foreground",
          "email": "contact@example.com",
          "phone": "+1 (555) 123-4567",
          "address": "123 Business St, City, State 12345",
          "fields": [
            {"id": "name", "label": "Name", "type": "text", "placeholder": "Your name", "required": true},
            {"id": "email", "label": "Email", "type": "email", "placeholder": "your@email.com", "required": true},
            {"id": "message", "label": "Message", "type": "textarea", "placeholder": "Your message...", "required": true}
          ]
        },
        {
          "type": "footer",
          "heading": "",
          "backgroundColor": "bg-muted",
          "textColor": "text-muted-foreground",
          "links": [
            {"label": "Privacy Policy", "href": "/privacy-policy"},
            {"label": "Terms & Conditions", "href": "/terms-conditions"}
          ]
        }
      ]
    },
    {
      "title": "Privacy Policy",
      "slug": "/privacy-policy",
      "isHomepage": false,
      "sections": [
        {
          "type": "navigation",
          "items": [
            {"label": "Home", "href": "/"},
            {"label": "Privacy Policy", "href": "/privacy-policy"},
            {"label": "Terms & Conditions", "href": "/terms-conditions"}
          ],
          "backgroundColor": "bg-background/80",
          "textColor": "text-foreground"
        },
        {
          "type": "about",
          "heading": "Privacy Policy",
          "subheading": "Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
          "content": "Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.\\n\\n**Information We Collect**\\nWe collect information you provide directly to us, including name, email address, and other contact details when you fill out forms or contact us.\\n\\n**How We Use Your Information**\\nWe use the information we collect to provide, maintain, and improve our services, respond to your inquiries, and send you important updates.\\n\\n**Data Security**\\nWe implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.\\n\\n**Your Rights**\\nYou have the right to access, correct, or delete your personal information at any time.",
          "backgroundColor": "bg-background",
          "textColor": "text-foreground"
        },
        {
          "type": "footer",
          "heading": "",
          "backgroundColor": "bg-muted",
          "textColor": "text-muted-foreground",
          "links": [
            {"label": "Privacy Policy", "href": "/privacy-policy"},
            {"label": "Terms & Conditions", "href": "/terms-conditions"}
          ]
        }
      ]
    },
    {
      "title": "Terms & Conditions",
      "slug": "/terms-conditions",
      "isHomepage": false,
      "sections": [
        {
          "type": "navigation",
          "items": [
            {"label": "Home", "href": "/"},
            {"label": "Privacy Policy", "href": "/privacy-policy"},
            {"label": "Terms & Conditions", "href": "/terms-conditions"}
          ],
          "backgroundColor": "bg-background/80",
          "textColor": "text-foreground"
        },
        {
          "type": "about",
          "heading": "Terms & Conditions",
          "subheading": "Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
          "content": "Please read these terms and conditions carefully before using our services.\\n\\n**Acceptance of Terms**\\nBy accessing and using this service, you accept and agree to be bound by the terms and conditions described herein.\\n\\n**Use of Service**\\nYou agree to use our service only for lawful purposes and in accordance with these terms. You may not use our service in any way that violates applicable laws.\\n\\n**Intellectual Property**\\nAll content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.\\n\\n**Limitation of Liability**\\nWe shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.",
          "backgroundColor": "bg-background",
          "textColor": "text-foreground"
        },
        {
          "type": "footer",
          "heading": "",
          "backgroundColor": "bg-muted",
          "textColor": "text-muted-foreground",
          "links": [
            {"label": "Privacy Policy", "href": "/privacy-policy"},
            {"label": "Terms & Conditions", "href": "/terms-conditions"}
          ]
        }
      ]
    }
  ],
  "colors": {
    "primary": "220 90% 56%",
    "secondary": "240 5% 64%",
    "accent": "340 82% 52%",
    "background": "0 0% 100%",
    "foreground": "222 47% 11%"
  }
}

CRITICAL RULES YOU MUST FOLLOW:
1. Return ONLY the raw JSON object - absolutely NO markdown code blocks (no \`\`\`json), NO explanations, NO extra text
2. The JSON must be valid and parseable - test it yourself before responding
3. ALL sections are REQUIRED in EXACT order: navigation → hero → about → services → stats → projects → testimonials → cta → contact → footer
4. CRITICAL: Each section MUST have an "id" field that EXACTLY matches the navigation href (about for #about, what-we-offer for #what-we-offer, recent-projects for #recent-projects, get-in-touch for #get-in-touch)
5. Image fields MUST be HIGHLY SPECIFIC 3-5 word search keywords unique to THIS business (e.g., "${category} workspace interior", "${prompt.substring(0, 30)} professional", "${businessName || category} team collaboration")
6. CRITICAL FOR IMAGE DIVERSITY: Every image keyword MUST be DIFFERENT and SPECIFIC to the business context. Include business type, industry specifics, or action words. Avoid generic terms like "business" or "professional" alone.
7. Hero image: Include the exact industry/service in keywords (e.g., "fitness trainer coaching client", "restaurant chef cooking kitchen")
8. About image: Show the team/workspace specific to this business (e.g., "dental clinic modern interior", "law firm partners meeting")
9. Project images: Each MUST be unique with specific details (e.g., "completed kitchen renovation modern", "wedding photography outdoor ceremony", "website design laptop screen")
10. Testimonial images: Vary demographics and settings (e.g., "asian business woman smiling", "senior male executive portrait", "young entrepreneur laptop cafe")
11. Services section MUST have EXACTLY 6 items with these icons: Sparkles, Zap, Heart, Star, Trophy, Target
12. Stats section MUST have EXACTLY 4 items with realistic numbers (e.g., "500+" not "50000+")
13. Projects section MUST have EXACTLY 6 items, each with UNIQUE specific image keywords and 2 tags
14. Testimonials section MUST have EXACTLY 3 items with realistic names, roles, and companies
15. Homepage navigation MUST include: Home, About, Services (#what-we-offer), Projects (#recent-projects), Contact (#get-in-touch)
16. CRITICAL: Navigation anchor links (#about, #what-we-offer, #recent-projects, #get-in-touch) MUST match the "id" fields of the corresponding sections EXACTLY
17. Privacy/Terms links appear ONLY in footer sections (page links starting with /)
18. Content must be specific to ${category} - use industry-relevant terminology
19. All content must be professional, benefit-focused, and conversion-optimized
20. Colors MUST be in HSL format: "220 90% 56%" (three numbers with spaces)
21. CRITICAL: Contact section MUST always include the "fields" array with EXACTLY these 3 fields: Name (text), Email (email), Message (textarea)
22. Contact section MUST be last before footer on homepage
23. Each page MUST have navigation and footer sections`;

    const userPrompt = `Business Name: ${businessName || 'Professional Business'}
Industry Category: ${category}
Business Description: ${prompt}
${websiteContext}

TASK: Generate a complete, high-quality ${category} website following the EXACT JSON structure in the system prompt.

REQUIREMENTS:
${websiteContext ? '1. PRIMARY GOAL: Match the style, tone, structure, and content type of the analyzed website\n2. Use the same industry terminology and approach as the reference site\n3. Replicate the professional quality and messaging strategy' : '1. Use industry-specific terminology for ${category}\n2. Create benefit-focused copy that converts visitors\n3. Build trust through professional, credible content'}
4. Include EXACTLY 6 services with varied, relevant icons
5. Include EXACTLY 4 impressive but realistic statistics
6. Include EXACTLY 6 diverse project examples with UNIQUE, SPECIFIC image keywords
7. Include EXACTLY 3 authentic testimonials with full names and roles
8. CRITICAL IMAGE KEYWORD RULES:
   - Every image keyword MUST be UNIQUE and SPECIFIC to this exact business
   - Hero: "${category} ${prompt.split(' ')[0]} professional action" (e.g., "fitness personal trainer workout session")
   - About: "${businessName || category} team workspace interior" (e.g., "dental clinic reception modern design")
   - Projects: Each with highly specific details (e.g., "completed residential bathroom renovation", "corporate website homepage design laptop", "wedding couple outdoor sunset photography")
   - Testimonials: Vary age, gender, ethnicity (e.g., "middle aged african american businessman", "young hispanic female entrepreneur", "senior caucasian executive portrait")
   - NO generic keywords like "business professional" or "team meeting" - be HIGHLY SPECIFIC
9. Ensure all navigation links use proper anchors (#about, #services) or page paths (/privacy-policy)
10. Create engaging headlines that communicate clear value propositions
11. Write professional content that demonstrates expertise in ${category}
12. Make every image search query DIFFERENT from all others - NO REPEATING patterns

${websiteContext ? '\nCRITICAL REMINDER: The analyzed website above is your REFERENCE MODEL. Generate content that matches its professional quality, style, and industry approach.' : `\nCreate a professional ${category} website that builds credibility and drives conversions through clear value communication.`}

OUTPUT: Return ONLY the raw JSON object with no markdown formatting.`;

    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key not found in secrets');
      return new Response(JSON.stringify({ error: 'Claude API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // IMPORTANT: declare aiContent here so it's available after the try/catch block
    let aiContent = '';
    let templateData: any = null;

    try {
      const aiPayload = {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      };
      console.log('Claude API payload:', JSON.stringify(aiPayload));
      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(aiPayload),
      });

      console.log('Claude API response status:', aiResponse.status);
      const responseText = await aiResponse.text();
      console.log('Claude API response body:', responseText);

      if (!aiResponse.ok) {
        return new Response(JSON.stringify({ error: `Claude API error: ${aiResponse.status} - ${responseText}` }), {
          status: aiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Try to parse JSON safely. If parsing fails, assume raw text.
      let aiData: any = null;
      try {
        aiData = JSON.parse(responseText);
      } catch (jsonErr) {
        console.warn('Failed to parse Claude response as JSON; falling back to raw text. parse error:', jsonErr);
        aiData = null;
      }

      // Flexible extraction to handle different Claude/Anthropic shapes
      const extractTextFromAnthropic = (data: any, rawText: string) => {
        // 1) If content array present (your previous code expected this)
        if (data && Array.isArray(data.content) && data.content.length > 0) {
          try {
            return data.content.map((c: any) => {
              if (typeof c === 'string') return c;
              if (c && typeof c.text === 'string') return c.text;
              if (c && (c?.role || c?.type) && c?.message) return String(c.message);
              return '';
            }).join('\n');
          } catch (e) {
            console.warn('Error concatenating data.content:', e);
          }
        }

        // 2) Common anthropic fields
        if (data && typeof data.completion === 'string') {
          return data.completion;
        }
        if (data && data.output && typeof data.output === 'object') {
          if (typeof data.output.text === 'string') return data.output.text;
          if (Array.isArray(data.output.parts)) return data.output.parts.join('\n');
        }

        // 3) If Claude returns top-level 'text' or similar
        if (data && typeof data.text === 'string') {
          return data.text;
        }

        // 4) Look for nested message content parts
        if (data && data.message && Array.isArray(data.message.content)) {
          // e.g., message.content = [{type:'output_text', text: '...'}]
          try {
            return data.message.content.map((p: any) => p.text || p.parts?.join?.('\n') || '').join('\n');
          } catch (e) {
            // ignore
          }
        }

        // 5) Fallback to raw text response
        return rawText;
      };

      aiContent = extractTextFromAnthropic(aiData, responseText);
      console.log('AI Response (extracted):', aiContent);

      if (!aiContent || aiContent.trim().length === 0) {
        console.error('Claude returned empty response after extraction', { aiData, responseText });
        return new Response(JSON.stringify({ error: 'Claude returned empty response' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      console.error('Claude API call failed:', err);
      return new Response(JSON.stringify({ error: `Claude API call failed: ${err}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate the JSON from AI response
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                       aiContent.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      templateData = JSON.parse(jsonStr);

      // Validate critical structure
      if (!templateData.websiteName || typeof templateData.websiteName !== 'string') {
        throw new Error('Invalid or missing websiteName');
      }
      if (!templateData.description || typeof templateData.description !== 'string') {
        throw new Error('Invalid or missing description');
      }
      if (!Array.isArray(templateData.pages) || templateData.pages.length === 0) {
        throw new Error('Invalid or missing pages array');
      }

      // Validate homepage exists and has required sections
      const homepage = templateData.pages.find((p: any) => p.isHomepage);
      if (!homepage) {
        throw new Error('No homepage found in generated template');
      }
      if (!Array.isArray(homepage.sections) || homepage.sections.length < 9) {
        throw new Error(`Homepage must have at least 9 sections, found ${homepage.sections?.length || 0}`);
      }

      // Validate required section types exist on homepage
      const requiredSections = ['navigation', 'hero', 'about', 'services', 'stats', 'projects', 'testimonials', 'cta', 'contact', 'footer'];
      const homepageSectionTypes = homepage.sections.map((s: any) => s.type);
      const missingSections = requiredSections.filter(type => !homepageSectionTypes.includes(type));
      if (missingSections.length > 0) {
        console.warn('Missing sections:', missingSections);
      }

      // Validate services section
      const servicesSection = homepage.sections.find((s: any) => s.type === 'services');
      if (servicesSection && (!Array.isArray(servicesSection.items) || servicesSection.items.length !== 6)) {
        console.warn(`Services section should have exactly 6 items, found ${servicesSection.items?.length || 0}`);
      }

      console.log('Template validation successful');
    } catch (parseError) {
      console.error('Failed to parse or validate AI response:', parseError);
      console.error('AI Response (raw):', aiContent);
      throw new Error(`Failed to parse AI generated template: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Fetch real images from Pexels for all sections
    console.log('Starting Pexels image fetching for template sections...');
    for (const page of templateData.pages) {
      for (const section of page.sections) {
        // Fetch hero/background images - use the image field as search query
        if (section.image && typeof section.image === 'string' && !section.image.startsWith('http')) {
          const searchQuery = section.image; // Use AI-provided keywords
          const fetchedImage = await fetchPexelsImage(searchQuery, 'large');
          if (fetchedImage) {
            section.image = fetchedImage;
          }
        }

        // Fetch images for gallery/feature items
        if (section.items && Array.isArray(section.items)) {
          for (const item of section.items) {
            if (item.image && typeof item.image === 'string' && !item.image.startsWith('http')) {
              const searchQuery = item.image; // Use AI-provided keywords
              const fetchedItemImage = await fetchPexelsImage(searchQuery, 'medium');
              if (fetchedItemImage) {
                item.image = fetchedItemImage;
              }
            }
          }
        }
      }
    }
    console.log('Completed Pexels image fetching');

    // Create the website in the database
    const { data: website, error: websiteError } = await supabaseClient
      .from('websites')
      .insert({
        user_id: effectiveUserId,
        name: templateData.websiteName,
        description: templateData.description,
        category: category,
        status: 'draft',
        settings: {
          colors: templateData.colors || {}
        }
      })
      .select()
      .single();

    if (websiteError) {
      console.error('Database error:', websiteError);
      throw websiteError;
    }

    // Create pages for the website
    const pagesData = templateData.pages.map((page: any) => ({
      website_id: website.id,
      title: page.title,
      slug: page.slug,
      content: page.sections || [],
      is_homepage: page.isHomepage || false,
      meta_title: `${page.title} - ${templateData.websiteName}`,
      meta_description: templateData.description
    }));

    const { error: pagesError } = await supabaseClient
      .from('pages')
      .insert(pagesData);

    if (pagesError) {
      console.error('Pages creation error:', pagesError);
      throw pagesError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        websiteId: website.id,
        websiteName: templateData.websiteName,
        message: 'Website template generated successfully!'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-website-template:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred generating the template'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL validation function to prevent SSRF attacks
function validateUrl(url: string): { valid: boolean; error?: string } {
  // Check if URL is a valid HTTP/HTTPS URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Only allow HTTP and HTTPS protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { valid: false, error: 'Only HTTP/HTTPS protocols allowed' };
  }

  // Block private IP ranges and localhost to prevent SSRF
  const hostname = parsedUrl.hostname.toLowerCase();
  const blockedPatterns = [
    /^(localhost|127\.\d+\.\d+\.\d+)$/i, // localhost and 127.x.x.x
    /^10\.\d+\.\d+\.\d+$/i, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+$/i, // 172.16.0.0/12
    /^192\.168\.\d+\.\d+$/i, // 192.168.0.0/16
    /^169\.254\.\d+\.\d+$/i, // AWS metadata 169.254.0.0/16
  ];

  if (blockedPatterns.some(pattern => pattern.test(hostname))) {
    return { valid: false, error: 'Access to private networks not allowed' };
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Authentication failed: Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the JWT token (remove 'Bearer ' prefix)
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client to verify the token
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message || 'User not found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL to prevent SSRF attacks
    const validation = validateUrl(url);
    if (!validation.valid) {
      console.error('URL validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping website:', url, 'for user:', user.id);

    // Fetch the HTML directly with proper headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const htmlResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!htmlResponse.ok) {
      console.error('Failed to fetch website:', htmlResponse.statusText);
      return new Response(
        JSON.stringify({ error: `Failed to fetch website: ${htmlResponse.statusText}` }),
        { status: htmlResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await htmlResponse.text();
    console.log('HTML fetched, length:', html.length);

    // Parse HTML using DOMParser
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse HTML' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract metadata
    const title = doc.querySelector('title')?.textContent?.trim() || 'Imported Website';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    console.log('Extracted title:', title);
    
    // Extract all CSS (inline and external links)
    const styles: Array<{type: 'link' | 'inline', content: string}> = [];
    
    // Get external stylesheets
    const linkElements = doc.querySelectorAll('link[rel="stylesheet"]');
    for (const link of linkElements) {
      const href = (link as Element).getAttribute('href');
      if (href) {
        try {
          const absoluteUrl = href.startsWith('http') ? href : new URL(href, url).href;
          styles.push({ type: 'link', content: absoluteUrl });
        } catch (e) {
          console.error('Invalid CSS URL:', href);
        }
      }
    }
    
    // Get inline styles
    const styleElements = doc.querySelectorAll('style');
    for (const style of styleElements) {
      if (style.textContent) {
        styles.push({ type: 'inline', content: style.textContent });
      }
    }
    
    console.log('Extracted styles:', styles.length);
    
    // Extract images
    const images: string[] = [];
    const imgElements = doc.querySelectorAll('img');
    for (const img of imgElements) {
      const src = (img as Element).getAttribute('src');
      if (src && !src.startsWith('data:')) {
        try {
          const absoluteUrl = src.startsWith('http') ? src : new URL(src, url).href;
          images.push(absoluteUrl);
        } catch (e) {
          console.error('Invalid image URL:', src);
        }
      }
    }
    
    console.log('Extracted images:', images.length);
    
    // Convert to markdown-like structure for section generation
    const markdown = convertToMarkdown(doc);
    console.log('Markdown length:', markdown.length);

    // Parse and transform the content into sections
    const sections = transformContentToSections(markdown, images, title, metaDescription);

    console.log('Generated sections:', sections.length);
    
    // Create website and page in database
    try {
      // Create the website
      const { data: website, error: websiteError } = await supabaseAdmin
        .from('websites')
        .insert({
          user_id: user.id,
          name: title || 'Imported Website',
          description: metaDescription || 'Imported from ' + url,
          status: 'draft',
        })
        .select()
        .single();

      if (websiteError) {
        console.error('Error creating website:', websiteError);
        throw new Error('Failed to create website: ' + websiteError.message);
      }

      console.log('Created website:', website.id);

      // Create the homepage with the scraped sections
      const { error: pageError } = await supabaseAdmin
        .from('pages')
        .insert({
          website_id: website.id,
          title: 'Home',
          slug: 'home',
          is_homepage: true,
          content: sections,
        });

      if (pageError) {
        console.error('Error creating page:', pageError);
        // Try to clean up the website if page creation failed
        await supabaseAdmin.from('websites').delete().eq('id', website.id);
        throw new Error('Failed to create page: ' + pageError.message);
      }

      console.log('Created homepage for website:', website.id);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Website imported successfully',
          websiteId: website.id,
          metadata: {
            title: title,
            description: metaDescription,
            url: url,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('Error in import-website function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function convertToMarkdown(doc: any): string {
  const body = doc.querySelector('body');
  if (!body) return '';
  
  let markdown = '';
  
  // Extract headings and text content
  const elements = body.querySelectorAll('h1, h2, h3, h4, p, li, a');
  
  for (const el of elements) {
    const text = el.textContent?.trim();
    if (!text || text.length < 5) continue;
    
    const tagName = el.tagName.toLowerCase();
    
    if (tagName === 'h1') {
      markdown += `# ${text}\n\n`;
    } else if (tagName === 'h2') {
      markdown += `## ${text}\n\n`;
    } else if (tagName === 'h3') {
      markdown += `### ${text}\n\n`;
    } else if (tagName === 'p' || tagName === 'li') {
      markdown += `${text}\n\n`;
    }
  }
  
  return markdown;
}

function detectSectionType(heading: string, content: string[]): string {
  const headingLower = heading.toLowerCase();
  const contentText = content.join(' ').toLowerCase();
  
  // Detect projects/portfolio
  if (headingLower.includes('project') || headingLower.includes('portfolio') || headingLower.includes('work')) {
    return 'projects';
  }
  
  // Detect skills/expertise
  if (headingLower.includes('skill') || headingLower.includes('technolog') || headingLower.includes('expertise')) {
    return 'skills';
  }
  
  // Detect timeline/experience
  if (headingLower.includes('experience') || headingLower.includes('education') || 
      headingLower.includes('timeline') || headingLower.includes('history')) {
    return 'timeline';
  }
  
  // Default to content for everything else
  return 'content';
}

// Filter content groups to only keep important ones
function filterContentGroups(groups: any[]): any[] {
  return groups.filter((group, index) => {
    // Always keep the first group (likely hero content)
    if (index === 0) return true;
    
    // Calculate total length
    const totalLength = group.heading.length + group.content.join('').length;
    
    // Skip navigation-like content
    if (group.heading.toLowerCase().includes('nav') || 
        group.heading.toLowerCase().includes('menu') ||
        group.heading.toLowerCase().includes('footer')) {
      return false;
    }
    
    // Skip very short content (likely navigation or minor elements) - reduced threshold
    if (totalLength < 50) { // Reduced from 100 to capture more content
      return false;
    }
    
    // Skip content that's just links - but be more lenient
    if (group.content.length > 0 && group.content.every((c: string) => c.length < 30)) { // Reduced from 50
      return false;
    }
    
    return true;
  });
}

function transformContentToSections(markdown: string, images: string[], title: string, description: string): any[] {
  const sections: any[] = [];
  
  // Split content into groups by headings
  const lines = markdown.split('\n');
  const contentGroups: Array<{heading: string, content: string[]}> = [];
  
  let currentGroup: {heading: string, content: string[]} = { heading: title || 'Welcome', content: [] };
  
  for (const line of lines) {
    if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
      if (currentGroup.content.length > 0 || contentGroups.length === 0) {
        contentGroups.push(currentGroup);
      }
      currentGroup = { 
        heading: line.replace(/^#+\s*/, '').trim(), 
        content: [] 
      };
    } else if (line.trim().length > 0) {
      currentGroup.content.push(line.trim());
    }
  }
  
  if (currentGroup.content.length > 0) {
    contentGroups.push(currentGroup);
  }
  
  console.log('Content groups found:', contentGroups.length);
  
  // Filter content groups
  const filteredGroups = filterContentGroups(contentGroups);
  console.log('Content groups found:', filteredGroups.length, 'filtered to:', Math.min(filteredGroups.length, 5), '(including hero)');
  
  // Always create a navigation section first
  const navItems = ['Home', 'About', 'Services', 'Portfolio', 'Contact'].slice(0, Math.min(filteredGroups.length, 5));
  sections.push({
    type: 'navigation',
    logo: title,
    items: navItems.map(item => ({
      label: item,
      href: `#${item.toLowerCase()}`
    })),
    backgroundColor: 'bg-background/95',
    textColor: 'text-foreground',
    position: 'sticky'
  });
  
  console.log('Navigation section created with', navItems.length, 'items');
  
  // Maximum 5 sections total (1 hero + 4 content sections)
  const maxSections = 5;
  let sectionCount = 1; // Start at 1 for navigation
  
  for (let i = 0; i < filteredGroups.length && sectionCount < maxSections; i++) {
    const group = filteredGroups[i];
    
    // First group becomes hero
    if (i === 0) {
      sections.push({
        type: 'hero',
        heading: group.heading,
        subheading: group.content[0] || description,
        content: group.content.slice(1).join(' ').substring(0, 500) || description, // Increased from 200
        image: images[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
        backgroundColor: 'bg-slate-950',
        textColor: 'text-white',
        showCTA: true,
        ctaText: 'Get Started',
        ctaUrl: '#contact',
      });
      sectionCount++;
      continue;
    }
    
    const sectionType = detectSectionType(group.heading, group.content);
    const sectionImage = images[Math.min(i, images.length - 1)] || null;
    
    if (sectionType === 'projects') {
      const projects = [];
      const itemsToProcess = Math.min(group.content.length, 6); // Increased to 6 projects
      
      for (let j = 0; j < itemsToProcess; j++) {
        const text = group.content[j];
        const parts = text.split(/[:-]/);
        projects.push({
          title: parts[0].trim().substring(0, 100), // Increased from 60
          description: parts.slice(1).join(':').trim().substring(0, 300) || text.substring(0, 300), // Increased from 150
          image: images[Math.min(j + 1, images.length - 1)] || null,
          tags: [],
          liveUrl: '',
          githubUrl: ''
        });
      }
      
      sections.push({
        type: 'projects',
        heading: group.heading,
        subheading: '',
        items: projects,
        backgroundColor: 'bg-background',
        textColor: 'text-foreground'
      });
    } else if (sectionType === 'skills') {
      const skills = group.content.slice(0, 12).map((text: string, idx: number) => { // Increased to 12 skills
        const match = text.match(/(\d+)%/);
        const level = match ? parseInt(match[1]) : 80 + (idx % 20);
        return {
          name: text.split(/[:.%]/)[0].trim().substring(0, 80), // Increased from 40
          level: level,
          icon: '⚡',
          category: group.heading.includes('Language') ? 'Programming Languages' : 
                   group.heading.includes('Framework') ? 'Frameworks' :
                   group.heading.includes('Tool') ? 'Tools' : 'Skills'
        };
      });
      
      sections.push({
        type: 'skills',
        heading: group.heading,
        subheading: '',
        items: skills,
        backgroundColor: 'bg-secondary/10',
        textColor: 'text-foreground',
        showPercentages: false
      });
    } else if (sectionType === 'timeline') {
      const items = group.content.slice(0, 6).map((text: string) => { // Increased to 6 timeline items
        const parts = text.split(/[-–—•]/);
        const bullets = parts.slice(1).filter((p: string) => p.trim().length > 10);
        return {
          title: parts[0].trim().substring(0, 120), // Increased from 70
          organization: 'Company',
          period: '2020 - Present',
          description: bullets[0]?.trim().substring(0, 400) || '', // Increased from 200
          bullets: bullets.slice(1, 8).map((b: string) => b.trim().substring(0, 250)) // Increased items and length
        };
      });
      
      sections.push({
        type: 'timeline',
        heading: group.heading,
        subheading: '',
        items: items,
        backgroundColor: 'bg-background',
        textColor: 'text-foreground'
      });
    } else {
      // Generic content section
      const contentImage = sectionImage;
      
      sections.push({
        type: 'content',
        heading: group.heading,
        subheading: '',
        content: group.content.join('\n\n').substring(0, 1200), // Increased from 600
        image: contentImage,
        backgroundColor: i % 2 === 0 ? 'bg-background' : 'bg-secondary/10',
        textColor: 'text-foreground'
      });
    }
    
    sectionCount++;
    
    if (sectionCount >= maxSections) {
      console.log('Reached maximum of', maxSections, 'sections, stopping processing');
      break;
    }
  }
  
  console.log('Generated sections:', sections.length, '(max', maxSections + ')');
  
  return sections;
}

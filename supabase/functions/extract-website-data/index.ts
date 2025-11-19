import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping website:', url);

    // Use Firecrawl to scrape the website
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: false, // Get full page including headers/footers where contact info usually is
        includeTags: ['a', 'footer', 'header', 'contact'], // Specifically include contact-related elements
      }),
    });

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.text();
      console.error('Firecrawl API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to scrape website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    const content = scrapeData.data?.markdown || '';
    const rawHtml = scrapeData.data?.html || '';
    const metadata = scrapeData.data?.metadata || {};

    console.log('Scraped content length:', content.length);
    console.log('HTML length:', rawHtml.length);
    
    // Combine both content sources for better extraction
    const fullContent = content + '\n' + rawHtml;

    // Extract information from the scraped content
    const extractedData: any = {
      businessName: metadata.title || '',
      website: url,
    };

    // Helper function to find content in contact-related sections
    const findInContactSection = (text: string): string => {
      const contactSections = text.split(/(?:contact|get in touch|reach us|find us|location|address|footer)/i);
      return contactSections.length > 1 ? contactSections.slice(1).join(' ').substring(0, 3000) : text;
    };

    const contactContent = findInContactSection(fullContent);

    // Extract email - search in HTML for mailto: links and content
    const htmlEmailRegex = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    const htmlEmails = [...rawHtml.matchAll(htmlEmailRegex)].map(m => m[1]);
    
    // Also extract from plain text in both markdown and HTML
    const emailRegex = /\b[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}\b/gi;
    const contentEmails = fullContent.match(emailRegex) || [];
    
    const allEmails = [...new Set([...htmlEmails, ...contentEmails])]; // Remove duplicates
    
    console.log('Found emails:', allEmails);
    
    // Filter and rank emails
    const validEmails = allEmails.filter((email: string) => {
      const lower = email.toLowerCase();
      return !lower.includes('example.com') && 
             !lower.includes('placeholder') &&
             !lower.includes('your-email') &&
             !lower.includes('noreply') &&
             !lower.includes('no-reply') &&
             !lower.includes('wix.com') &&
             !lower.includes('wordpress.com');
    });
    
    // Prioritize emails from contact section
    const contactEmails = contactContent.match(emailRegex) || [];
    const priorityEmail = contactEmails.find((e: string) => validEmails.includes(e));
    
    if (priorityEmail) {
      extractedData.email = priorityEmail;
    } else if (validEmails.length > 0) {
      // Prefer info@, contact@, hello@ over others
      const preferredEmail = validEmails.find((e: string) => 
        /^(info|contact|hello|enquir|sales)@/i.test(e)
      );
      extractedData.email = preferredEmail || validEmails[0];
    }
    
    console.log('Selected email:', extractedData.email);

    // Extract phone numbers - search in HTML for tel: links first  
    const htmlPhoneRegex = /(?:tel:|phone:|telephone:)\s*([+\d\s\-\(\)]{10,})/gi;
    const htmlPhones = [...rawHtml.matchAll(htmlPhoneRegex)].map(m => m[1].trim());
    
    // Also search in href attributes
    const hrefPhoneRegex = /href=["']tel:([^"']+)["']/gi;
    const hrefPhones = [...rawHtml.matchAll(hrefPhoneRegex)].map(m => m[1].trim());
    
    // Extract phone numbers with context awareness
    const phoneContext = contactContent || fullContent;
    
    // UK phone patterns (most specific first)
    const ukPhoneRegex = /(?:(?:\+44|0044|0)\s?(?:\d\s?){9,10})|(?:\+44\s?\d{4}\s?\d{6})|(?:0\d{4}\s?\d{6})|(?:0\d{3}\s?\d{3}\s?\d{4})/g;
    const ukPhones = phoneContext.match(ukPhoneRegex) || [];
    
    // International phone patterns
    const intlPhoneRegex = /(?:\+\d{1,3}\s?)(?:\(\d{1,4}\)|\d{1,4})(?:[-\s]?\d{1,4}){2,4}/g;
    const intlPhones = phoneContext.match(intlPhoneRegex) || [];
    
    // Combine all sources and remove duplicates
    const allPhones = [...new Set([...htmlPhones, ...hrefPhones, ...ukPhones, ...intlPhones])];
    
    console.log('Found phones:', allPhones);
    
    const validPhones = allPhones.filter((phone: string) => {
      const digits = phone.replace(/\D/g, '');
      const hasEnoughDigits = digits.length >= 10 && digits.length <= 15;
      
      // Filter out years, dates, and other non-phone numbers
      const isNotYear = !/^\d{4}$/.test(phone.trim());
      const isNotDate = !/\d{2}\/\d{2}\/\d{4}/.test(phone);
      const isNotShortNumber = digits.length !== 4; // filter out years like "2000"
      
      return hasEnoughDigits && isNotYear && isNotDate && isNotShortNumber;
    });
    
    if (validPhones.length > 0) {
      extractedData.phone = validPhones[0].trim();
    }
    
    console.log('Selected phone:', extractedData.phone);

    // Extract location/address - search in both content and HTML
    const lines = fullContent.split('\n');
    const addressKeywords = [
      /\baddress\s*:/i, /\blocation\s*:/i, /\boffice\s*:/i,
      /\bheadquarters\s*:/i, /\bbased\s+in\b/i, /\bfind\s+us\b/i,
      /\bvisit\s+us\b/i, /\bour\s+office\b/i
    ];
    
    // Look for UK postcode first (strong indicator of address)
    const ukPostcodeRegex = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b/i;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      // Skip empty lines and very short lines
      if (line.length < 5) continue;
      
      // Check if line has postcode
      const postcodeMatch = line.match(ukPostcodeRegex);
      if (postcodeMatch) {
        // Look back up to 3 lines to get full address
        let addressLines = [];
        const startIdx = Math.max(0, i - 3);
        for (let j = startIdx; j <= i; j++) {
          const addressLine = lines[j].trim();
          if (addressLine.length > 3 && addressLine.length < 100) {
            addressLines.push(addressLine);
          }
        }
        if (addressLines.length > 0) {
          extractedData.location = addressLines.join(', ');
          break;
        }
      }
      
      // Check for address keywords
      if (addressKeywords.some(pattern => pattern.test(lowerLine))) {
        // Extract text after the keyword
        let address = line.substring(Math.min(line.length, 20));
        
        // Or check next few lines
        if (address.length < 10 && i + 1 < lines.length) {
          const nextLines = [];
          for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
            const nextLine = lines[j].trim();
            if (nextLine.length > 5 && nextLine.length < 100) {
              nextLines.push(nextLine);
            }
          }
          if (nextLines.length > 0) {
            address = nextLines.join(', ');
          }
        }
        
        if (address.length > 10 && address.length < 200) {
          extractedData.location = address;
          break;
        }
      }
    }

    // Extract business description for notes
    if (metadata.description) {
      extractedData.notes = metadata.description;
    }

    console.log('Final extracted data:', JSON.stringify(extractedData, null, 2));

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-website-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

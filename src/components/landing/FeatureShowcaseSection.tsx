import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dashboardImg from "@/assets/features/dashboard-new.png";
import clientManagementImg from "@/assets/features/client-management-new.png";
import schedulingImg from "@/assets/features/scheduling-new.png";
import requestServicesImg from "@/assets/features/request-services-new.png";
import quotationImg from "@/assets/features/quotation-new.png";
import jobsImg from "@/assets/features/jobs-new.png";
import invoicingImg from "@/assets/features/invoicing-new.png";
import expensesImg from "@/assets/features/expenses-new.png";
import timesheetsImg from "@/assets/features/timesheets-new.png";
import websiteBuilderImg from "@/assets/features/website-builder-new.png";
import mobileAppImg from "@/assets/features/mobile-app.jpg";

const features = [
  {
    title: "Dashboard",
    description: "Monitor your business performance with real-time insights and analytics at a glance.",
    color: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
    image: dashboardImg,
  },
  {
    title: "Client Management",
    description: "Keep all your customer information organized and accessible in one central hub.",
    color: "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
    image: clientManagementImg,
  },
  {
    title: "Scheduling",
    description: "Smart calendar management that syncs across your team and sends automated reminders.",
    color: "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50",
    image: schedulingImg,
  },
  {
    title: "Request Services",
    description: "Let customers submit service requests online 24/7 with custom intake forms.",
    color: "from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50",
    image: requestServicesImg,
  },
  {
    title: "Quotation",
    description: "Create professional quotes in minutes with templates and send them instantly.",
    color: "from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50",
    image: quotationImg,
  },
  {
    title: "Jobs",
    description: "Track every job from start to finish with complete visibility and status updates.",
    color: "from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50",
    image: jobsImg,
  },
  {
    title: "Invoicing",
    description: "Generate and send invoices automatically, track payments, and get paid faster.",
    color: "from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50",
    image: invoicingImg,
  },
  {
    title: "Expenses",
    description: "Capture receipts and track expenses on-the-go to maximize your tax deductions.",
    color: "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50",
    image: expensesImg,
  },
  {
    title: "Timesheets",
    description: "Accurate time tracking for your team with GPS verification and mobile clock-in.",
    color: "from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50",
    image: timesheetsImg,
  },
  {
    title: "Website Builder",
    description: "Launch a professional website in minutes with drag-and-drop simplicity.",
    color: "from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/50",
    image: websiteBuilderImg,
  },
  {
    title: "Mobile App",
    description: "Run your business from anywhere with our native iOS and Android apps.",
    color: "from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50",
    image: mobileAppImg,
  },
];

export const FeatureShowcaseSection = () => {
  // Duplicate features array for infinite scroll effect
  const duplicatedFeatures = [...features, ...features, ...features];

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.querySelector('#feature-showcase .overflow-x-auto') as HTMLElement;
    if (!container) return;

    const scrollAmount = 470; // card width + gap
    const newScrollPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newScrollPosition, behavior: 'smooth' });

    // Reset scroll position for infinite loop
    setTimeout(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const singleSetWidth = features.length * scrollAmount;
      
      if (container.scrollLeft >= singleSetWidth * 2) {
        container.scrollTo({ left: singleSetWidth, behavior: 'auto' });
      } else if (container.scrollLeft <= 0) {
        container.scrollTo({ left: singleSetWidth, behavior: 'auto' });
      }
    }, 500);
  };

  return (
    <section id="feature-showcase" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 gap-6">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              ONE PLATFORM.
              <br />
              ALL THE FEATURES.
            </h2>
          </div>
          <div className="flex-1 lg:text-right">
            <p className="text-lg text-muted-foreground mb-6 max-w-xl lg:ml-auto">
              Stop wasting time and money connecting and managing multiple tools. We've seamlessly integrated everything into one intuitive platform.
            </p>
            <Button size="lg" variant="outline" className="rounded-full">
              View All Features
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          {/* Scroll Indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable Area */}
          <div className="overflow-x-auto pb-6 scrollbar-hide">
            <div className="flex gap-6 w-max">
              {duplicatedFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className={`flex-shrink-0 w-[450px] h-[680px] overflow-hidden border-2 border-foreground bg-gradient-to-b ${feature.color} hover-lift group`}
                >
                  <div className="p-6 flex flex-col h-full relative">
                    {/* Floating UI Mockup */}
                    <div className="mb-6 flex-1 relative flex items-center justify-center">
                      {/* Main floating element */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`relative ${
                          feature.title === "Mobile App" 
                            ? "w-[180px]" 
                            : "w-[95%] max-w-[420px]"
                        } transform hover:scale-105 transition-transform duration-300`}>
                          <div className={`bg-background shadow-2xl overflow-hidden border border-border/20 ${
                            feature.title === "Mobile App" 
                              ? "rounded-[2.5rem]" 
                              : "rounded-xl"
                          }`}>
                            <img 
                              src={feature.image} 
                              alt={feature.title}
                              className="w-full h-auto"
                            />
                          </div>
                          {/* Floating accent elements */}
                          <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-base text-foreground/80 leading-relaxed">
                        {feature.description}
                      </p>
                      <button className="inline-flex items-center gap-2 text-base font-semibold group-hover:gap-3 transition-all">
                        Learn More
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => handleScroll('left')}
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => handleScroll('right')}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

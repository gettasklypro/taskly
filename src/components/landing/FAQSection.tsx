import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQSection = () => {
  const faqs = [
    {
      question: "How long does it take to get started?",
      answer: "You can set up Taskly in under 5 minutes. Add your services, invite your team, and start booking jobs right away—no tech skills needed."
    },
    {
      question: "Do I need a credit card for the free trial?",
      answer: "No. You can explore Taskly for 14 days completely free—no credit card required, no commitment."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. You can cancel or change your plan anytime with one click from your dashboard."
    },
    {
      question: "Can I use Taskly on my phone?",
      answer: "Yes. Taskly works on iOS and Android, so you can manage your jobs, clients, and schedule from anywhere."
    },
    {
      question: "Can I import my existing data?",
      answer: "Yes. You can import clients, jobs, and invoices from spreadsheets or other tools in just a few steps."
    }
  ];

  return (
    <section id="faq" className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about TASKLY
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

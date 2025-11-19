import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Mike Johnson",
      role: "Owner, Johnson Plumbing",
      content: "TASKLY helped me cut admin time in half. Now I can focus on what I do best - serving my customers.",
      rating: 5,
      image: "MJ"
    },
    {
      name: "Sarah Martinez",
      role: "Founder, Clean Sweep Services",
      content: "The scheduling feature alone is worth it. We've increased our daily capacity by 30% without hiring more staff.",
      rating: 5,
      image: "SM"
    },
    {
      name: "David Chen",
      role: "Owner, Elite HVAC",
      content: "Getting paid faster has been a game-changer. Our cash flow improved dramatically within the first month.",
      rating: 5,
      image: "DC"
    },
    {
      name: "Lisa Thompson",
      role: "Owner, Green Lawn Care",
      content: "My clients love the professional quotes and easy payment options. It's made us look like a much bigger company.",
      rating: 5,
      image: "LT"
    },
    {
      name: "James Wilson",
      role: "Founder, Wilson Electric",
      content: "The mobile app means I can run my business from anywhere. It's incredibly freeing and efficient.",
      rating: 5,
      image: "JW"
    },
    {
      name: "Emily Brown",
      role: "Owner, Sparkle Cleaning Co",
      content: "Best investment I've made in my business. The ROI was immediate and the support team is fantastic.",
      rating: 5,
      image: "EB"
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by thousands of service pros
          </h2>
          <p className="text-xl text-muted-foreground">
            See what our customers have to say
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col p-6 rounded-lg border bg-card"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
              </div>

              <p className="text-sm mb-6 flex-1">"{testimonial.content}"</p>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

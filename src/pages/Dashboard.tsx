import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { FileQuestion, FileText, Briefcase, Receipt, Clock, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface StatCard {
  new: number;
  completed: number;
  overdue?: number;
  approved?: number;
  draft?: number;
  changesRequested?: number;
  requiresInvoicing?: number;
  actionRequired?: number;
  active?: number;
  pastDue?: number;
  awaitingPayment?: number;
  graphData: { value: number }[];
}

interface AppointmentItem {
  id: string;
  client: string;
  initials: string;
  time: string;
  jobType: string;
  status: 'Active' | 'To go' | 'Completed';
  total: number;
  remaining: number;
}

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState<string>("");
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [planType, setPlanType] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [requests, setRequests] = useState<StatCard>({
    new: 0,
    completed: 0,
    overdue: 0,
    graphData: [],
  });
  const [quotes, setQuotes] = useState<StatCard>({
    approved: 0,
    draft: 0,
    changesRequested: 0,
    new: 0,
    completed: 0,
    graphData: [],
  });
  const [jobs, setJobs] = useState<StatCard>({
    requiresInvoicing: 0,
    actionRequired: 0,
    active: 0,
    new: 0,
    completed: 0,
    graphData: [],
  });
  const [invoices, setInvoices] = useState<StatCard>({
    pastDue: 0,
    awaitingPayment: 0,
    draft: 0,
    new: 0,
    completed: 0,
    graphData: [],
  });
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getCurrencySymbol = (currencyCode: string): string => {
    const currencyMap: { [key: string]: string } = {
      USD: "$", GBP: "£", EUR: "€", CAD: "C$", AUD: "A$", NZD: "NZ$",
      JPY: "¥", INR: "₹", BRL: "R$", MXN: "MX$", ZAR: "R", SEK: "kr",
      NOK: "kr", DKK: "kr", CHF: "CHF", PLN: "zł", CZK: "Kč", SGD: "S$"
    };
    return currencyMap[currencyCode] || "$";
  };

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile for name and currency
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, plan_type, trial_end_date, currency")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      if (profile?.plan_type) {
        setPlanType(profile.plan_type);
      }

      if (profile?.currency) {
        setCurrency(profile.currency);
      }

      // Calculate trial days remaining
      if (profile?.trial_end_date && (profile.plan_type === 'basic' || profile.plan_type === 'trial')) {
        const endDate = new Date(profile.trial_end_date);
        const today = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        setTrialDaysRemaining(daysRemaining > 0 ? daysRemaining : 0);
      }

      // Fetch requests data
      const { data: requestsData } = await supabase
        .from("service_requests")
        .select("status, created_at")
        .eq("user_id", user.id);

      const newRequests = requestsData?.filter(r => r.status === 'new').length || 0;
      const completedRequests = requestsData?.filter(r => r.status === 'converted').length || 0;
      const overdueRequests = requestsData?.filter(r => r.status === 'lost').length || 0;

      // Fetch quotes data
      const { data: quotesData } = await supabase
        .from("quotes")
        .select("status, created_at")
        .eq("user_id", user.id);

      const approvedQuotes = quotesData?.filter(q => q.status === 'approved').length || 0;
      const draftQuotes = quotesData?.filter(q => q.status === 'draft').length || 0;
      const changesRequestedQuotes = quotesData?.filter(q => q.status === 'sent').length || 0;

      // Fetch jobs data
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("status, created_at")
        .eq("user_id", user.id);

      const requiresInvoicingJobs = jobsData?.filter(j => j.status === 'completed').length || 0;
      const actionRequiredJobs = jobsData?.filter(j => j.status === 'draft').length || 0;
      const activeJobs = jobsData?.filter(j => j.status === 'in_progress' || j.status === 'scheduled').length || 0;

      // Fetch invoices data
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("status, created_at, due_date")
        .eq("user_id", user.id);

      const now = new Date();
      const pastDueInvoices = invoicesData?.filter(i => 
        i.status === 'sent' && i.due_date && new Date(i.due_date) < now
      ).length || 0;
      const awaitingPaymentInvoices = invoicesData?.filter(i => i.status === 'sent').length || 0;
      const draftInvoices = invoicesData?.filter(i => i.status === 'draft').length || 0;

      // Generate mock graph data (in real app, would aggregate by date)
      const mockGraphData = Array.from({ length: 7 }, (_, i) => ({ value: Math.floor(Math.random() * 10) + 5 }));

      setRequests({ new: newRequests, completed: completedRequests, overdue: overdueRequests, graphData: mockGraphData });
      setQuotes({ approved: approvedQuotes, draft: draftQuotes, changesRequested: changesRequestedQuotes, new: 0, completed: 0, graphData: mockGraphData });
      setJobs({ requiresInvoicing: requiresInvoicingJobs, actionRequired: actionRequiredJobs, active: activeJobs, new: 0, completed: 0, graphData: mockGraphData });
      setInvoices({ pastDue: pastDueInvoices, awaitingPayment: awaitingPaymentInvoices, draft: draftInvoices, new: 0, completed: 0, graphData: mockGraphData });

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: todayJobs } = await supabase
        .from("jobs")
        .select("*, contacts(name)")
        .eq("user_id", user.id)
        .gte("scheduled_date", today)
        .lt("scheduled_date", `${today}T23:59:59`)
        .order("scheduled_date", { ascending: true });

      const appointmentsData: AppointmentItem[] = todayJobs?.map(job => ({
        id: job.id,
        client: job.contacts?.name || 'Unknown',
        initials: (job.contacts?.name || 'UK').split(' ').map(n => n[0]).join(''),
        time: new Date(job.scheduled_date || '').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        jobType: job.title || 'Service Call',
        status: job.status === 'completed' ? 'Completed' : job.status === 'in_progress' ? 'Active' : 'To go',
        total: Number(job.total_amount) || 0,
        remaining: Number(job.total_amount) || 0,
      })) || [];

      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const channel = supabase
      .channel("dashboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, fetchDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes" }, fetchDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, fetchDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, fetchDashboardData)
      .subscribe();

    return () => {
      clearInterval(timeInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  const StatCardComponent = ({ 
    title, 
    icon: Icon, 
    data, 
    primaryLabel, 
    primaryValue, 
    secondaryItems 
  }: { 
    title: string; 
    icon: any; 
    data: { value: number }[]; 
    primaryLabel: string; 
    primaryValue: number; 
    secondaryItems: { label: string; value: number }[] 
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-3xl font-bold">{primaryValue}</div>
            <div className="text-xs text-muted-foreground">{primaryLabel}</div>
          </div>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          {secondaryItems.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="font-semibold">{item.value}</span>
              <span className="text-muted-foreground text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="p-4 sm:p-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {format(currentTime, "EEEE, MMMM d, yyyy")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {getGreeting()}{userName ? `, ${userName}` : ""}
            </p>
          </div>
          {trialDaysRemaining !== null && (planType === 'basic' || planType === 'trial') && (
            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary">
                Trial: {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Summary Cards Grid */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            <>
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </>
          ) : (
            <>
              <StatCardComponent
                title="Requests"
                icon={FileQuestion}
                data={requests.graphData}
                primaryLabel="New"
                primaryValue={requests.new}
                secondaryItems={[
                  { label: "Completed", value: requests.completed },
                  { label: "Overdue", value: requests.overdue || 0 },
                ]}
              />
              <StatCardComponent
                title="Quotes"
                icon={FileText}
                data={quotes.graphData}
                primaryLabel="Approved"
                primaryValue={quotes.approved || 0}
                secondaryItems={[
                  { label: "Draft", value: quotes.draft || 0 },
                  { label: "Changes Req", value: quotes.changesRequested || 0 },
                ]}
              />
              <StatCardComponent
                title="Jobs"
                icon={Briefcase}
                data={jobs.graphData}
                primaryLabel="Requires Invoicing"
                primaryValue={jobs.requiresInvoicing || 0}
                secondaryItems={[
                  { label: "Action Req", value: jobs.actionRequired || 0 },
                  { label: "Active", value: jobs.active || 0 },
                ]}
              />
              <StatCardComponent
                title="Invoices"
                icon={Receipt}
                data={invoices.graphData}
                primaryLabel="Past Due"
                primaryValue={invoices.pastDue || 0}
                secondaryItems={[
                  { label: "Awaiting Payment", value: invoices.awaitingPayment || 0 },
                  { label: "Draft", value: invoices.draft || 0 },
                ]}
              />
            </>
          )}
        </div>

        {/* Appointments and Payments Section */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Appointments - Takes 2 columns */}
          <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No appointments scheduled for today</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {apt.initials}
                        </div>
                        <div>
                          <div className="font-medium">{apt.client}</div>
                          <div className="text-sm text-muted-foreground">{apt.time} • {apt.jobType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          apt.status === 'Completed' ? 'default' : 
                          apt.status === 'Active' ? 'secondary' : 
                          'outline'
                        }>
                          {apt.status}
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold">{getCurrencySymbol(currency)}{apt.total.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{getCurrencySymbol(currency)}{apt.remaining.toFixed(2)} remaining</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payments - Takes 1 column */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-5 w-5 flex items-center justify-center font-semibold text-base">{getCurrencySymbol(currency)}</span>
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </>
              ) : (
                <>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">On its way to bank</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">{getCurrencySymbol(currency)}0.00</div>
                    <div className="text-xs text-muted-foreground">Expected by: --</div>
                  </div>

                  <div className="p-4 border rounded-lg bg-primary/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Available for instant payout</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-3">{getCurrencySymbol(currency)}0.00</div>
                    <Button className="w-full" size="sm" disabled>
                      Get it Now
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

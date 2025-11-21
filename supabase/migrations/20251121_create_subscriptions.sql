-- Create subscriptions table for Paddle integration
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  paddle_subscription_id text not null,
  paddle_customer_id text,
  plan_id text not null,
  status text not null,
  next_billing_at timestamp,
  created_at timestamp default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
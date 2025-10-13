-- Create businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  reward_title TEXT DEFAULT '',
  reward_description TEXT DEFAULT '',
  visit_goal INTEGER DEFAULT 5,
  business_logo_url TEXT,
  reward_setup_completed BOOLEAN DEFAULT FALSE,
  setup_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  email_confirmed BOOLEAN DEFAULT FALSE,
  visits INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  qr_code_url TEXT,
  qr_data TEXT,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(phone, business_id)
);

-- Create visits table for detailed visit tracking
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  points_earned INTEGER DEFAULT 1,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards table for reward redemptions
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  reward_title TEXT NOT NULL,
  points_used INTEGER NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_settings table for QR codes and settings
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  qr_code_data TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  points_per_visit INTEGER DEFAULT 1,
  email_notifications BOOLEAN DEFAULT TRUE,
  auto_rewards BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-codes', 'qr-codes', true);

-- Create policy for QR codes bucket
CREATE POLICY "QR codes are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can upload QR codes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update QR codes" ON storage.objects
  FOR UPDATE USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies for businesses table
CREATE POLICY "Users can view their own business" ON businesses
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own business" ON businesses
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for customers table
CREATE POLICY "Users can view customers of their business" ON customers
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can insert customers for their business" ON customers
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can update customers of their business" ON customers
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

-- Enable RLS for new tables
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for visits table
CREATE POLICY "Users can view visits of their business customers" ON visits
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can insert visits for their business customers" ON visits
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

-- Create policies for rewards table
CREATE POLICY "Users can view rewards of their business customers" ON rewards
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can insert rewards for their business customers" ON rewards
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can update rewards of their business customers" ON rewards
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

-- Create policies for business_settings table
CREATE POLICY "Users can view their business settings" ON business_settings
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can insert their business settings" ON business_settings
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can update their business settings" ON business_settings
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_last_visit ON customers(last_visit);
CREATE INDEX idx_businesses_email ON businesses(email);
CREATE INDEX idx_visits_customer_id ON visits(customer_id);
CREATE INDEX idx_visits_business_id ON visits(business_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_rewards_customer_id ON rewards(customer_id);
CREATE INDEX idx_rewards_business_id ON rewards(business_id);
CREATE INDEX idx_business_settings_qr_code ON business_settings(qr_code_data);
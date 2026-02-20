-- Create user_settings table for storing dashboard preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  show_overall_progress BOOLEAN DEFAULT true,
  show_daily_checklist BOOLEAN DEFAULT true,
  show_task_progress BOOLEAN DEFAULT true,
  show_goal_progress BOOLEAN DEFAULT true,
  show_last_7_days BOOLEAN DEFAULT true,
  show_progress_table BOOLEAN DEFAULT true,
  color_scheme TEXT DEFAULT 'blue-pink',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

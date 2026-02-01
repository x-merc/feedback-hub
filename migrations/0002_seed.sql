-- Seed data for Feedback Hub
-- Sample tickets from various sources

INSERT INTO tickets (id, title, content, source, category, friction_point, sentiment, sentiment_score, urgency, status, customer_name, customer_email, ai_synopsis, created_at) VALUES
('t001', 'Dashboard loading extremely slow', 'The main dashboard takes over 10 seconds to load. This is happening consistently for the past 3 days. We have a team of 50 users and everyone is experiencing this issue. This is severely impacting our productivity.', 'support', 'bug', 'performance', 'negative', -0.85, 'critical', 'open', 'John Smith', 'john@acmecorp.com', 'Critical performance issue affecting 50-user team. Dashboard load times exceed 10 seconds, ongoing for 3 days.', datetime('now', '-2 hours')),

('t002', 'Feature Request: Dark mode support', 'Would love to see dark mode added to the application. Many of us work late hours and the bright interface causes eye strain. This would be a great quality of life improvement.', 'discord', 'feature_request', 'ui_ux', 'positive', 0.65, 'low', 'open', 'Sarah Chen', 'sarah@devteam.io', 'User requests dark mode feature to reduce eye strain during late-night work sessions.', datetime('now', '-1 day')),

('t003', 'API rate limiting documentation unclear', 'I spent 2 hours trying to figure out the rate limits for the API. The documentation mentions limits but does not specify the exact numbers or how the sliding window works. Please clarify.', 'github', 'documentation', 'confusing_docs', 'negative', -0.45, 'medium', 'open', 'Mike Johnson', 'mike@startup.co', 'Developer frustrated with unclear API rate limiting documentation. Requests specific numbers and sliding window explanation.', datetime('now', '-3 days')),

('t004', 'Love the new analytics feature!', 'Just wanted to say the new analytics dashboard is amazing! The visualizations are beautiful and the data export feature saves us hours every week. Great job team!', 'twitter', 'other', NULL, 'positive', 0.95, 'low', 'closed', 'Emma Wilson', 'emma@analytics.pro', 'Positive feedback praising new analytics dashboard. User highlights visualizations and time-saving data export.', datetime('now', '-5 days')),

('t005', 'Integration with Slack not working', 'We set up the Slack integration following the docs but notifications are not coming through. We have verified the webhook URL and permissions. Need urgent help as we rely on this for alerts.', 'email', 'bug', 'integration', 'negative', -0.70, 'high', 'in_progress', 'David Lee', 'david@techfirm.com', 'Slack integration failing despite correct setup. User verified webhook and permissions. Blocking alert workflow.', datetime('now', '-6 hours')),

('t006', 'Confusing onboarding flow', 'As a new user, I found the onboarding process very confusing. There are too many steps and its not clear what each setting does. I almost gave up before completing setup.', 'forum', 'ui_ux', 'onboarding', 'negative', -0.55, 'medium', 'open', 'Lisa Park', 'lisa@newuser.net', 'New user nearly abandoned product due to complex onboarding. Too many unclear steps and settings.', datetime('now', '-2 days')),

('t007', 'Request: Bulk import from CSV', 'We need to migrate 10,000 records from our old system. Currently we can only add items one by one through the UI. A CSV import feature would save us weeks of manual work.', 'support', 'feature_request', 'missing_feature', 'neutral', 0.10, 'high', 'open', 'Tom Brown', 'tom@enterprise.org', 'Enterprise user needs bulk CSV import for 10K record migration. Current single-item UI is impractical.', datetime('now', '-4 days')),

('t008', 'Mobile app crashes on Android 14', 'The mobile app crashes immediately after login on Android 14 devices. Tested on Pixel 8 and Samsung S24. Worked fine on Android 13. Please fix ASAP.', 'github', 'bug', 'performance', 'negative', -0.80, 'critical', 'open', 'Alex Kim', 'alex@mobiledev.io', 'Critical bug: App crashes post-login on Android 14. Confirmed on Pixel 8 and Samsung S24.', datetime('now', '-12 hours')),

('t009', 'Pricing tier confusion', 'The pricing page shows different features for Pro tier than what I actually get after subscribing. The comparison table needs to be updated to match reality.', 'email', 'documentation', 'pricing', 'negative', -0.60, 'medium', 'open', 'Rachel Green', 'rachel@smb.com', 'Pricing page discrepancy: Pro tier features dont match actual subscription. Comparison table outdated.', datetime('now', '-1 day')),

('t010', 'Excellent customer support experience', 'Had an issue with billing and your support team resolved it within 30 minutes. Special thanks to Agent Maria who was incredibly helpful and patient. Will definitely recommend!', 'support', 'other', NULL, 'positive', 0.90, 'low', 'resolved', 'Chris Taylor', 'chris@happycustomer.com', 'Glowing review of support experience. Billing issue resolved in 30 minutes. Agent Maria praised for helpfulness.', datetime('now', '-7 days')),

('t011', 'Keyboard shortcuts not working on Firefox', 'None of the keyboard shortcuts work when using Firefox 125. They work fine on Chrome. This is frustrating as I prefer Firefox for privacy reasons.', 'discord', 'bug', 'ui_ux', 'negative', -0.50, 'medium', 'open', 'Nina Patel', 'nina@webdev.co', 'Firefox 125 compatibility issue: keyboard shortcuts non-functional. Works on Chrome. User prefers Firefox.', datetime('now', '-3 days')),

('t012', 'Need webhook retry mechanism', 'When our server is temporarily down, we lose webhook events permanently. Please add automatic retry with exponential backoff. This is standard practice for webhook implementations.', 'github', 'feature_request', 'missing_feature', 'neutral', -0.20, 'high', 'open', 'James Wilson', 'james@backend.dev', 'Feature request: Webhook retry with exponential backoff. Currently events lost during server downtime.', datetime('now', '-5 days')),

('t013', 'Search results are irrelevant', 'The search function returns completely unrelated results. Searching for "invoice" shows me user profiles and settings pages. The search algorithm needs improvement.', 'forum', 'bug', 'ui_ux', 'negative', -0.65, 'medium', 'open', 'Maria Garcia', 'maria@searchtest.com', 'Search functionality broken: returns irrelevant results. Invoice search shows profiles and settings.', datetime('now', '-4 days')),

('t014', 'Great API documentation', 'Just integrated your API into our system. The documentation is excellent - clear examples, good error descriptions, and the Postman collection was super helpful. Thank you!', 'twitter', 'other', NULL, 'positive', 0.85, 'low', 'closed', 'Kevin Zhang', 'kevin@integration.io', 'Positive API integration feedback. Documentation praised for clarity, examples, and Postman collection.', datetime('now', '-6 days')),

('t015', 'Two-factor authentication issues', 'After enabling 2FA, I sometimes dont receive the SMS code. Have to request multiple times. This is a security feature that needs to be reliable.', 'support', 'bug', 'performance', 'negative', -0.70, 'high', 'open', 'Amy Foster', 'amy@security.net', 'Intermittent 2FA SMS delivery failure. User must request codes multiple times. Security reliability concern.', datetime('now', '-8 hours'));

-- Add some tags
INSERT INTO ticket_tags (ticket_id, tag) VALUES
('t001', 'performance'),
('t001', 'dashboard'),
('t001', 'urgent'),
('t002', 'dark-mode'),
('t002', 'accessibility'),
('t003', 'api'),
('t003', 'documentation'),
('t005', 'slack'),
('t005', 'integration'),
('t005', 'webhook'),
('t006', 'ux'),
('t006', 'onboarding'),
('t007', 'import'),
('t007', 'csv'),
('t007', 'migration'),
('t008', 'mobile'),
('t008', 'android'),
('t008', 'crash'),
('t011', 'firefox'),
('t011', 'keyboard'),
('t012', 'webhook'),
('t012', 'reliability'),
('t013', 'search'),
('t015', '2fa'),
('t015', 'sms');

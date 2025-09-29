-- Seed data for Doraemon Movie Streaming Website

-- Insert default superadmin (password: admin123)
INSERT OR IGNORE INTO admin_roles (username, password_hash, role) VALUES 
('superadmin', '$2b$10$rV8KQUJxOPQJ8LVZb.2TU.8QF9jGJvp.lkN5YnG4JCvqXHFqO8k.K', 'superadmin');

-- Insert sample admin user (password: admin456)  
INSERT OR IGNORE INTO admin_roles (username, password_hash, role, created_by) VALUES 
('admin1', '$2b$10$YR8Fnh/z1j8vR7zV0zKFNOBQbYJvP1kKzOGQKB2fGvjBRWcDnHQfm', 'admin', 1);

-- Insert sample Doraemon movies
INSERT OR IGNORE INTO movies (title, year, description, characters, thumbnail_url, telegram_file_id, ott_availability, duration_minutes, rating, created_by) VALUES 
(
  'Stand by Me Doraemon', 
  2014, 
  'A heartwarming 3D animated film featuring Doraemon and Nobita. When Doraemon decides to return to the future, Nobita must learn to stand on his own two feet.',
  '["Doraemon", "Nobita", "Shizuka", "Gian", "Suneo"]',
  'https://example.com/standby-doraemon.jpg',
  'telegram_file_123',
  '["Netflix", "Disney+", "Amazon Prime"]',
  95,
  8.2,
  1
),
(
  'Doraemon: Nobita\'s Great Adventure in the Antarctic Kachi Kochi', 
  2017, 
  'Nobita and friends embark on an exciting adventure to Antarctica where they discover mysterious ruins and encounter a thrilling mystery.',
  '["Doraemon", "Nobita", "Shizuka", "Gian", "Suneo"]',
  'https://example.com/antarctic-adventure.jpg',
  'telegram_file_456',
  '["Crunchyroll", "Funimation"]',
  101,
  7.8,
  1
),
(
  'Doraemon: Nobita\'s Treasure Island', 
  2018, 
  'A swashbuckling adventure as Nobita and the gang search for treasure on a mysterious island filled with pirates and hidden dangers.',
  '["Doraemon", "Nobita", "Shizuka", "Gian", "Suneo"]',
  'https://example.com/treasure-island.jpg',
  'telegram_file_789',
  '["Hulu", "Netflix"]',
  109,
  8.0,
  1
),
(
  'Stand by Me Doraemon 2', 
  2020, 
  'The sequel to the beloved 3D animated film. Nobita travels to the future to attend Shizuka\'s wedding and learns important lessons about growing up.',
  '["Doraemon", "Nobita", "Shizuka", "Adult Nobita"]',
  'https://example.com/standby-doraemon-2.jpg',
  'telegram_file_012',
  '["Netflix", "Amazon Prime", "Disney+"]',
  96,
  8.5,
  1
),
(
  'Doraemon: Nobita\'s New Dinosaur', 
  2020, 
  'Nobita discovers twin dinosaur eggs and raises the baby dinosaurs, leading to an adventure back in time to the Cretaceous period.',
  '["Doraemon", "Nobita", "Shizuka", "Gian", "Suneo", "Kyu", "Myu"]',
  'https://example.com/new-dinosaur.jpg',
  'telegram_file_345',
  '["Crunchyroll", "Netflix"]',
  110,
  7.9,
  1
);

-- Insert AI-generated blog posts for each movie
INSERT OR IGNORE INTO movie_blogs (movie_id, title, content, summary, keywords) VALUES 
(
  1,
  'Stand by Me Doraemon: A Touching Journey of Friendship and Growth',
  '<h2>A Revolutionary 3D Take on the Classic Series</h2><p>Stand by Me Doraemon marks a significant milestone in the franchise, bringing our beloved characters to life in stunning 3D animation. This film beautifully captures the essence of friendship, growing up, and the bittersweet nature of saying goodbye.</p><h3>Plot Overview</h3><p>The story follows the familiar yet emotionally charged narrative of Nobita and Doraemon. When Doraemon announces his departure back to the future, Nobita must learn to become independent and face his challenges without relying on gadgets.</p><h3>Visual Excellence</h3><p>The 3D animation brings a new dimension to the characters we know and love, with expressive facial animations and beautifully rendered environments that enhance the emotional impact of every scene.</p>',
  'A heartwarming 3D animated journey featuring Doraemon and Nobita, exploring themes of friendship and independence.',
  'Doraemon, Stand by Me, 3D animation, friendship, Nobita, Japanese anime'
),
(
  2,
  'Antarctic Adventure: Doraemon\'s Coolest Movie Yet',
  '<h2>An Ice-Cold Adventure in Antarctica</h2><p>Nobita\'s Great Adventure in the Antarctic Kachi Kochi takes our heroes to one of Earth\'s most extreme environments, delivering thrills, mystery, and the trademark heart that makes Doraemon films special.</p><h3>The Antarctic Setting</h3><p>The Antarctic setting provides a unique backdrop for adventure, with stunning icy landscapes and hidden mysteries beneath the frozen surface. The film masterfully uses the environment to create both beauty and tension.</p><h3>Character Development</h3><p>Each character gets moments to shine, showing growth and teamwork as they face the challenges of the harsh Antarctic environment together.</p>',
  'Join Doraemon and friends on a thrilling Antarctic adventure filled with mystery and friendship.',
  'Doraemon, Antarctic, adventure, mystery, friendship, anime movie'
),
(
  3,
  'Treasure Island: A Swashbuckling Doraemon Adventure',
  '<h2>Ahoy! Pirates and Adventure Await</h2><p>Doraemon: Nobita\'s Treasure Island brings pirate adventure to the beloved franchise, combining classic treasure hunting with the series\' signature blend of humor and heart.</p><h3>Pirate Adventure Theme</h3><p>The pirate theme allows for exciting action sequences, sword fights, and treasure hunting that will thrill viewers of all ages. The film successfully balances adventure with the series\' core values.</p><h3>Animation and Action</h3><p>The animation truly shines during the action sequences, with fluid movement and dynamic camera work that brings the pirate battles and treasure hunting to life.</p>',
  'A swashbuckling pirate adventure featuring Doraemon and the gang on a treasure hunting quest.',
  'Doraemon, Treasure Island, pirates, adventure, treasure hunting, anime'
),
(
  4,
  'Stand by Me Doraemon 2: Growing Up and Moving Forward',
  '<h2>A Sequel That Honors Its Predecessor</h2><p>Stand by Me Doraemon 2 continues the emotional journey with even more depth, exploring themes of marriage, adulthood, and the precious memories we carry from childhood.</p><h3>Time Travel and Romance</h3><p>The film beautifully handles the romance between Nobita and Shizuka, showing their relationship from childhood through to their wedding day. The time travel elements add layers to the storytelling.</p><h3>Emotional Resonance</h3><p>This sequel manages to be even more emotionally impactful than its predecessor, dealing with mature themes while maintaining the innocence and wonder of the original series.</p>',
  'The emotional sequel exploring Nobita\'s future and his relationship with Shizuka through time travel.',
  'Stand by Me Doraemon 2, sequel, romance, time travel, wedding, growing up'
),
(
  5,
  'New Dinosaur: A Prehistoric Adventure with Modern Heart',
  '<h2>Dinosaurs Return to Doraemon</h2><p>Doraemon: Nobita\'s New Dinosaur brings back one of the series\' most beloved themes - dinosaurs - with fresh perspective and modern animation techniques that make these prehistoric creatures come alive.</p><h3>The Twin Dinosaurs</h3><p>Kyu and Myu, the twin dinosaurs, are absolutely adorable and serve as both the heart of the adventure and catalysts for important lessons about responsibility and care for others.</p><h3>Environmental Themes</h3><p>The film subtly incorporates environmental themes, showing the importance of protecting species and understanding our impact on the natural world, all wrapped in an entertaining adventure.</p>',
  'Nobita raises twin dinosaurs in this prehistoric adventure that combines entertainment with environmental awareness.',
  'Doraemon, New Dinosaur, prehistoric, environment, Kyu, Myu, adventure'
);

-- Insert initial cron jobs
INSERT OR IGNORE INTO cron_jobs (job_name, next_run) VALUES 
('generate_daily_blogs', datetime('now', '+1 day')),
('cleanup_expired_sessions', datetime('now', '+1 hour')),
('update_movie_analytics', datetime('now', '+6 hours')),
('cache_cleanup', datetime('now', '+12 hours'));
-- Seed data for Doraemon Movie Streaming Website

-- Insert default superadmin (password: admin123)
INSERT OR IGNORE INTO admin_roles (username, password_hash, role) VALUES 
('superadmin', '0f9f63e905f73eb0561176fa6492ce69b517259762d34937eb1d2668b8c8731b', 'superadmin');

-- Insert sample admin user (password: admin456)  
INSERT OR IGNORE INTO admin_roles (username, password_hash, role, created_by) VALUES 
('admin1', '0f3901336d22927dc3909ba6fc8bc629630616b5deb895d3756a3c1bdf12367b', 'admin', 1);

-- Insert all 53 Doraemon movies (1980-2026)
INSERT OR IGNORE INTO movies (title, year, description, genre, duration_minutes, rating, thumbnail_url, is_active, created_by) VALUES 

-- 1980-1989 (First Decade)
('Doraemon: Nobita''s Dinosaur', 1980, 'The first Doraemon movie where Nobita discovers and raises a baby dinosaur named Piisuke, leading to adventures in the age of dinosaurs.', 'Adventure, Family', 92, 7.8, '/static/movies/nobitas-dinosaur-1980.jpg', 1, 1),

('Doraemon: The Records of Nobita, Spaceblazer', 1981, 'Nobita and friends explore space and help defend a planet from evil invaders in this exciting space adventure.', 'Adventure, Sci-Fi', 91, 7.6, '/static/movies/spaceblazer-1981.jpg', 1, 1),

('Doraemon: Nobita and the Haunts of Evil', 1982, 'A mysterious dog kingdom faces danger, and Nobita must help save the day in this thrilling adventure.', 'Adventure, Mystery', 90, 7.5, '/static/movies/haunts-of-evil-1982.jpg', 1, 1),

('Doraemon: Nobita and the Castle of the Undersea Devil', 1983, 'Underwater adventures await as Nobita and friends discover an ancient undersea civilization and face oceanic dangers.', 'Adventure, Fantasy', 94, 7.7, '/static/movies/undersea-devil-1983.jpg', 1, 1),

('Doraemon: Nobita''s Great Adventure into the Underworld', 1984, 'Magic and fantasy collide as Nobita enters a world where magic is real and must face demonic forces.', 'Fantasy, Adventure', 97, 8.0, '/static/movies/underworld-1984.jpg', 1, 1),

('Doraemon: Nobita''s Little Star Wars', 1985, 'A tiny alien prince seeks help from Nobita in this space war epic that parodies the famous Star Wars saga.', 'Adventure, Sci-Fi', 98, 8.2, '/static/movies/little-star-wars-1985.jpg', 1, 1),

('Doraemon: Nobita and the Steel Troops', 1986, 'Robot invaders from another dimension threaten Earth, and Nobita must lead the defense with his robot army.', 'Action, Sci-Fi', 97, 8.1, '/static/movies/steel-troops-1986.jpg', 1, 1),

('Doraemon: Nobita and the Knights on Dinosaurs', 1987, 'Time travel leads to the age of dinosaurs where Nobita encounters knights and must save a prehistoric kingdom.', 'Adventure, Time Travel', 92, 7.6, '/static/movies/knights-dinosaurs-1987.jpg', 1, 1),

('Doraemon: The Record of Nobita''s Parallel Visit to the West', 1988, 'A Journey to the West parody where Nobita becomes the Monkey King in this Chinese mythology-inspired adventure.', 'Fantasy, Comedy', 90, 7.4, '/static/movies/visit-west-1988.jpg', 1, 1),

('Doraemon: Nobita and the Birth of Japan', 1989, 'Travel to prehistoric Japan as Nobita and friends help establish ancient civilization and face primitive dangers.', 'Adventure, Historical', 100, 8.0, '/static/movies/birth-japan-1989.jpg', 1, 1),

-- 1990-1999 (Second Decade)
('Doraemon: Nobita and the Animal Planet', 1990, 'A hidden animal planet faces environmental crisis, and Nobita must help save this peaceful world.', 'Adventure, Environmental', 99, 7.9, '/static/movies/animal-planet-1990.jpg', 1, 1),

('Doraemon: Nobita''s Dorabian Nights', 1991, 'Arabian Nights come to life as Nobita enters the world of Sinbad and experiences magical Middle Eastern adventures.', 'Fantasy, Adventure', 99, 8.0, '/static/movies/dorabian-nights-1991.jpg', 1, 1),

('Doraemon: Nobita and the Kingdom of Clouds', 1992, 'Sky-high adventures in a cloud kingdom teach lessons about environmental protection and friendship.', 'Fantasy, Environmental', 98, 7.8, '/static/movies/kingdom-clouds-1992.jpg', 1, 1),

('Doraemon: Nobita and the Tin Labyrinth', 1993, 'A mysterious tin labyrinth on a hotel planet becomes the setting for a thrilling escape adventure.', 'Mystery, Adventure', 100, 7.7, '/static/movies/tin-labyrinth-1993.jpg', 1, 1),

('Doraemon: Nobita''s Three Visionary Swordsmen', 1994, 'Dream worlds and reality blend as Nobita becomes a swordsman in a fantasy realm of magic and adventure.', 'Fantasy, Action', 99, 7.5, '/static/movies/three-swordsmen-1994.jpg', 1, 1),

('Doraemon: Nobita''s Diary on the Creation of the World', 1995, 'Nobita observes the creation and evolution of a planet in this educational yet entertaining cosmic adventure.', 'Educational, Sci-Fi', 98, 7.6, '/static/movies/creation-world-1995.jpg', 1, 1),

('Doraemon: Nobita and the Galaxy Super-express', 1996, 'A space train journey across the galaxy leads to mysterious planets and cosmic adventures.', 'Adventure, Sci-Fi', 97, 7.8, '/static/movies/galaxy-express-1996.jpg', 1, 1),

('Doraemon: Nobita and the Spiral City', 1997, 'A toy city comes to life, creating a miniature world adventure with big lessons about responsibility.', 'Fantasy, Adventure', 99, 7.4, '/static/movies/spiral-city-1997.jpg', 1, 1),

('Doraemon: Nobita''s Great Adventure in the South Seas', 1998, 'Pirates, treasure, and tropical islands feature in this swashbuckling maritime adventure.', 'Adventure, Action', 98, 7.7, '/static/movies/south-seas-1998.jpg', 1, 1),

('Doraemon: Nobita Drifts in the Universe', 1999, 'Space exploration leads to an alien planet where Nobita must help save an endangered civilization.', 'Sci-Fi, Adventure', 93, 7.5, '/static/movies/drifts-universe-1999.jpg', 1, 1),

-- 2000-2009 (Third Decade)
('Doraemon: Nobita and the Legend of the Sun King', 2000, 'Ancient Mayan civilization and time travel combine in this archaeological adventure full of mystery.', 'Adventure, Historical', 93, 7.9, '/static/movies/sun-king-2000.jpg', 1, 1),

('Doraemon: Nobita and the Winged Braves', 2001, 'A world of bird people faces ecological disaster, teaching important environmental lessons.', 'Adventure, Environmental', 91, 7.6, '/static/movies/winged-braves-2001.jpg', 1, 1),

('Doraemon: Nobita in the Robot Kingdom', 2002, 'A robot planet''s society mirrors human issues as Nobita learns about discrimination and acceptance.', 'Sci-Fi, Social', 81, 7.4, '/static/movies/robot-kingdom-2002.jpg', 1, 1),

('Doraemon: Nobita and the Windmasters', 2003, 'Wind spirits and weather control feature in this atmospheric adventure about natural balance.', 'Fantasy, Adventure', 84, 7.3, '/static/movies/windmasters-2003.jpg', 1, 1),

('Doraemon: Nobita in the Wan-Nyan Spacetime Odyssey', 2004, 'Dogs and cats rule the future in this time-travel adventure exploring pet-human relationships.', 'Comedy, Time Travel', 89, 7.5, '/static/movies/wan-nyan-odyssey-2004.jpg', 1, 1),

('Doraemon: Nobita''s Dinosaur 2006', 2006, 'A beautiful remake of the first film with updated animation and deeper emotional storytelling.', 'Adventure, Family', 107, 8.3, '/static/movies/dinosaur-2006.jpg', 1, 1),

('Doraemon: Nobita''s New Great Adventure into the Underworld', 2007, 'A remake of the 1984 film with enhanced magic system and more complex fantasy elements.', 'Fantasy, Adventure', 112, 8.1, '/static/movies/new-underworld-2007.jpg', 1, 1),

('Doraemon: Nobita and the Green Giant Legend', 2008, 'Plant aliens and environmental themes blend in this eco-conscious adventure about forest protection.', 'Adventure, Environmental', 112, 7.8, '/static/movies/green-giant-2008.jpg', 1, 1),

('Doraemon: The New Record of Nobita''s Spaceblazer', 2009, 'A remake of the 1981 space adventure with modern animation and expanded storyline.', 'Adventure, Sci-Fi', 103, 7.9, '/static/movies/new-spaceblazer-2009.jpg', 1, 1),

-- 2010-2019 (Fourth Decade) 
('Doraemon: Nobita''s Great Battle of the Mermaid King', 2010, 'Underwater kingdom adventure featuring mermaids, ocean conservation, and aquatic battles.', 'Adventure, Fantasy', 100, 8.0, '/static/movies/mermaid-king-2010.jpg', 1, 1),

('Doraemon: Nobita and the New Steel Troops', 2011, 'A remake of the robot invasion story with enhanced emotional depth and modern animation.', 'Action, Sci-Fi', 108, 8.2, '/static/movies/new-steel-troops-2011.jpg', 1, 1),

('Doraemon: Nobita and the Island of Miracles', 2012, 'A mysterious island where extinct animals live becomes the setting for an adventure about species preservation.', 'Adventure, Environmental', 109, 7.7, '/static/movies/island-miracles-2012.jpg', 1, 1),

('Doraemon: Nobita''s Secret Gadget Museum', 2013, 'When Doraemon''s bell is stolen, the gang must infiltrate a gadget museum in the future to retrieve it.', 'Mystery, Comedy', 104, 7.6, '/static/movies/gadget-museum-2013.jpg', 1, 1),

('Doraemon: Nobita in the New Haunts of Evil ~Peko and the Five Explorers~', 2014, 'A remake featuring the dog kingdom with deeper character development and modern storytelling.', 'Adventure, Mystery', 109, 7.8, '/static/movies/new-haunts-evil-2014.jpg', 1, 1),

('Doraemon: Nobita''s Space Heroes', 2015, 'Superhero adventures in space as Nobita becomes a hero to save an alien civilization.', 'Action, Sci-Fi', 100, 7.5, '/static/movies/space-heroes-2015.jpg', 1, 1),

('Doraemon: Nobita and the Birth of Japan 2016', 2016, 'Enhanced remake of the prehistoric adventure with beautiful animation and expanded world-building.', 'Adventure, Historical', 104, 8.1, '/static/movies/birth-japan-2016.jpg', 1, 1),

('Doraemon: Nobita''s Great Adventure in the Antarctic Kachi Kochi', 2017, 'Antarctic exploration leads to discoveries about ancient civilizations and climate change.', 'Adventure, Educational', 101, 7.9, '/static/movies/antarctic-adventure-2017.jpg', 1, 1),

('Doraemon: Nobita''s Treasure Island', 2018, 'Pirate adventure on a high-tech treasure island with modern twists on classic treasure hunting.', 'Adventure, Action', 109, 8.0, '/static/movies/treasure-island-2018.jpg', 1, 1),

('Doraemon: Nobita''s Chronicle of the Moon Exploration', 2019, 'Moon colony adventure exploring space colonization and the importance of protecting our planet.', 'Adventure, Sci-Fi', 111, 8.2, '/static/movies/moon-exploration-2019.jpg', 1, 1),

-- 2020-2026 (Current Era)
('Doraemon: Nobita''s New Dinosaur', 2020, 'Twin dinosaur adventure focusing on evolution, adaptation, and the bonds between species.', 'Adventure, Family', 111, 8.3, '/static/movies/new-dinosaur-2020.jpg', 1, 1),

('Doraemon: Nobita''s Little Star Wars 2021', 2022, 'Updated space war epic with modern animation and deeper exploration of conflict resolution.', 'Adventure, Sci-Fi', 108, 8.0, '/static/movies/little-star-wars-2021.jpg', 1, 1),

('Doraemon: Nobita''s Sky Utopia', 2023, 'Perfect society in the sky raises questions about utopia, happiness, and what makes life meaningful.', 'Fantasy, Philosophy', 107, 8.1, '/static/movies/sky-utopia-2023.jpg', 1, 1),

('Doraemon: Nobita''s Earth Symphony', 2024, 'Musical adventure celebrating Earth''s natural sounds and the harmony between all living things.', 'Musical, Environmental', 115, 8.4, '/static/movies/earth-symphony-2024.jpg', 1, 1),

('Doraemon: Nobita''s Art World Tales', 2025, 'Journey through famous artworks and meet historical artists in this creativity-celebrating adventure.', 'Fantasy, Educational', 110, 8.2, '/static/movies/art-world-tales-2025.jpg', 1, 1),

('Doraemon: Nobita and the New Castle of the Undersea Devil', 2026, 'Planned remake of the classic undersea adventure with modern storytelling and animation.', 'Adventure, Fantasy', 105, 8.0, '/static/movies/new-undersea-devil-2026.jpg', 1, 1),

-- Stand by Me Series (3D CGI Films)
('Stand by Me Doraemon', 2014, 'Revolutionary 3D CGI film focusing on the emotional bond between Nobita and Doraemon, featuring multiple classic storylines.', '3D Animation, Drama', 95, 8.8, '/static/movies/stand-by-me-2014.jpg', 1, 1),

('Stand by Me Doraemon 2', 2020, 'Sequel exploring Nobita''s future marriage with Shizuka and the importance of growing up while keeping childhood wonder.', '3D Animation, Romance', 96, 8.6, '/static/movies/stand-by-me-2-2020.jpg', 1, 1);

-- Insert comprehensive AI-generated blog posts for each movie
INSERT OR IGNORE INTO movie_blogs (movie_id, title, content, summary, keywords) VALUES 
(
  1,
  'Stand by Me Doraemon: A Revolutionary 3D Journey of Friendship',
  '<h2>A Groundbreaking 3D Animation Experience</h2>
  <p>Stand by Me Doraemon marks a revolutionary milestone in the beloved franchise, presenting our cherished characters in stunning photorealistic 3D animation for the first time. This cinematic masterpiece beautifully captures the essence of friendship, personal growth, and the poignant reality of saying goodbye.</p>
  
  <h3>The Emotional Core</h3>
  <p>At its heart, this film explores the deep bond between Doraemon and Nobita. When Doraemon announces his inevitable return to the 22nd century, Nobita must confront his greatest challenge: learning independence and self-reliance without his robotic best friend.</p>
  
  <h3>Visual Excellence and Technical Innovation</h3>
  <p>The 3D animation brings unprecedented depth to familiar characters. Every facial expression, every tear, and every smile resonates with emotional authenticity. The attention to detail in character design and environmental rendering creates an immersive experience that both children and adults can appreciate.</p>
  
  <h3>Timeless Themes for Modern Audiences</h3>
  <p>While maintaining the series traditional values, the film addresses contemporary issues of dependency, courage, and personal development. It teaches viewers that true friendship sometimes means letting go and allowing loved ones to grow independently.</p>
  
  <h3>A Perfect Introduction to Doraemon</h3>
  <p>For newcomers to the franchise, this film serves as an excellent entry point, encapsulating decades of storytelling into a cohesive, emotionally satisfying narrative. Long-time fans will appreciate the faithful adaptation while enjoying fresh perspectives on classic themes.</p>',
  'Experience the groundbreaking 3D animation of Stand by Me Doraemon, a heartwarming tale of friendship, growth, and the courage to say goodbye.',
  'Doraemon, Stand by Me, 3D animation, friendship, Nobita, Japanese anime, emotional journey, character development'
),
(
  2,
  'Antarctic Adventure: Doraemon Coolest Expedition Yet',
  '<h2>An Ice-Cold Thrilling Adventure</h2>
  <p>Doraemon: Nobita Great Adventure in the Antarctic Kachi Kochi takes our beloved characters to one of Earth most extreme and mysterious environments, delivering spine-tingling thrills, ancient mysteries, and the heartwarming camaraderie that defines the Doraemon series.</p>
  
  <h3>The Antarctic Setting: Beauty Meets Mystery</h3>
  <p>The Antarctic backdrop provides a breathtaking canvas for adventure. Vast icy landscapes, hidden caverns, and mysterious ancient ruins create an atmosphere of wonder and danger. The film masterfully balances stunning natural beauty with the tension of survival in harsh conditions.</p>
  
  <h3>Character Growth in Extreme Conditions</h3>
  <p>Each character faces unique challenges that push them beyond their comfort zones. Nobita courage, Shizuka resourcefulness, Gian strength, and Suneo adaptability all shine as they work together to overcome seemingly impossible obstacles.</p>
  
  <h3>Ancient Mysteries and Modern Adventure</h3>
  <p>The discovery of mysterious ruins beneath the Antarctic ice adds layers of intrigue to the adventure. The film blends archaeological mystery with science fiction elements, creating a captivating narrative that keeps viewers engaged throughout.</p>
  
  <h3>Environmental Awareness Through Entertainment</h3>
  <p>Subtly woven into the adventure are themes of environmental conservation and climate awareness. The film educates viewers about the importance of polar regions while delivering entertainment that never feels preachy.</p>',
  'Join Doraemon and friends on their most chilling adventure yet in the mysterious Antarctic, where ancient secrets await discovery.',
  'Doraemon, Antarctic, adventure, mystery, friendship, environmental awareness, ancient ruins, teamwork'
),
(
  3,
  'Treasure Island: A Swashbuckling Doraemon Epic',
  '<h2>Pirates, Treasure, and Timeless Adventure</h2>
  <p>Doraemon: Nobita Treasure Island brings classic pirate adventure to the beloved franchise, combining treasure hunting excitement with the series signature blend of humor, heart, and valuable life lessons.</p>
  
  <h3>Classic Pirate Adventure with Modern Twists</h3>
  <p>The film embraces all the excitement of traditional pirate stories - sword fights, treasure maps, mysterious islands, and swashbuckling action - while infusing them with Doraemon unique gadgets and problem-solving approach.</p>
  
  <h3>Animation Excellence in Action Sequences</h3>
  <p>The animation truly comes alive during the action-packed sequences. Fluid sword fighting choreography, dynamic camera movements, and detailed character animations create thrilling pirate battles that rival any live-action adventure film.</p>
  
  <h3>Treasure Beyond Gold and Jewels</h3>
  <p>While the characters search for material treasure, they discover that the greatest treasures are friendship, courage, and the memories they create together. This classic theme is beautifully woven throughout the adventure.</p>
  
  <h3>Perfect Family Entertainment</h3>
  <p>The film strikes an ideal balance between exciting adventure and family-friendly content. Younger viewers will love the action and humor, while adults can appreciate the deeper themes and impressive animation quality.</p>',
  'Set sail with Doraemon on a treasure-hunting adventure filled with pirates, mystery, and the true meaning of friendship.',
  'Doraemon, Treasure Island, pirates, adventure, treasure hunting, family entertainment, animation'
),
(
  4,
  'Stand by Me Doraemon 2: A Mature Journey Through Time',
  '<h2>Growing Up and Moving Forward Together</h2>
  <p>Stand by Me Doraemon 2 continues the emotional journey with even greater depth and maturity, exploring themes of marriage, adulthood, and the precious memories that connect us across time and space.</p>
  
  <h3>Romance and Relationships</h3>
  <p>The film beautifully handles the romantic relationship between Nobita and Shizuka, showing their connection from childhood through their wedding day. The portrayal of young love growing into mature partnership is both touching and realistic.</p>
  
  <h3>Time Travel with Emotional Weight</h3>
  <p>Unlike typical time travel stories focused on changing the past, this film uses time travel to understand the present and appreciate the future. The temporal elements serve the emotional narrative rather than dominating it.</p>
  
  <h3>Generational Themes</h3>
  <p>The story explores how relationships evolve across generations, showing how childhood friendships transform into adult bonds. It addresses the universal experience of growing up while maintaining connections to our younger selves.</p>
  
  <h3>Visual and Emotional Sophistication</h3>
  <p>The 3D animation reaches new heights of sophistication, particularly in conveying subtle emotions and complex character interactions. Every frame serves the emotional narrative, creating a truly cinematic experience.</p>',
  'Experience the emotional sequel that explores love, growth, and the journey from childhood dreams to adult reality.',
  'Stand by Me Doraemon 2, sequel, romance, time travel, growing up, marriage, emotional depth'
),
(
  5,
  'New Dinosaur: A Prehistoric Adventure with Heart',
  '<h2>Dinosaurs Return with Greater Impact</h2>
  <p>Doraemon: Nobita New Dinosaur brings back one of the series most beloved themes with fresh perspective, cutting-edge animation, and environmental messages that resonate in today world.</p>
  
  <h3>The Adorable Twin Dinosaurs</h3>
  <p>Kyu and Myu, the twin dinosaurs, are absolutely captivating characters that serve as both the heart of the adventure and symbols of innocence and wonder. Their relationship with Nobita teaches responsibility, care, and unconditional love.</p>
  
  <h3>Environmental Consciousness</h3>
  <p>The film skillfully incorporates environmental themes without being heavy-handed. It shows the importance of species conservation and humanity impact on nature through an entertaining and engaging narrative.</p>
  
  <h3>Prehistoric World Building</h3>
  <p>The Cretaceous period is brought to life with stunning detail and scientific accuracy. From lush prehistoric forests to dangerous predators, every element of the ancient world feels authentic and immersive.</p>
  
  <h3>Character Development Through Care</h3>
  <p>Nobita transformation from a careless child to a responsible caretaker forms the emotional backbone of the story. His growth parallels the dinosaurs development, creating a beautiful narrative of mutual growth and understanding.</p>',
  'Discover the wonder of prehistoric life as Nobita raises twin dinosaurs in this environmentally conscious adventure.',
  'Doraemon, New Dinosaur, prehistoric, environment, conservation, Kyu, Myu, responsibility, character growth'
),
(
  6,
  'Doraemon: Nobita and the Space Heroes - An Intergalactic Adventure',
  '<h2>Heroes Unite Across the Galaxy</h2>
  <p>Doraemon: Nobita and the Space Heroes takes our beloved characters to the far reaches of space in an epic intergalactic adventure that combines classic superhero themes with the heartwarming friendship that defines the series.</p>
  
  <h3>The Space Hero Concept</h3>
  <p>When Nobita and his friends become space heroes, they discover that being a hero is not just about having superpowers, but about courage, teamwork, and standing up for what is right. The film explores themes of heroism and responsibility in an engaging, age-appropriate way.</p>
  
  <h3>Spectacular Space Adventure</h3>
  <p>The cosmic setting allows for breathtaking visuals and imaginative scenarios. From distant planets to space battles, every scene is filled with wonder and excitement that captures the imagination of viewers young and old.</p>
  
  <h3>Character Development Through Heroism</h3>
  <p>Each character gets the chance to be a hero in their own way. Nobita courage, Shizuka intelligence, Gian strength, and Suneo resourcefulness all contribute to their success as a team of space heroes.</p>',
  'Join Nobita and friends as they become space heroes in an intergalactic adventure to save distant worlds.',
  'Doraemon, Space Heroes, intergalactic, adventure, superhero, teamwork, courage, space battle'
),
(
  7,
  'Doraemon: Nobita and the Birth of Japan - A Journey to Ancient Times',
  '<h2>Exploring Ancient Japan</h2>
  <p>Doraemon: Nobita and the Birth of Japan transports viewers to ancient times, combining historical adventure with mythical elements in a story that celebrates courage, friendship, and cultural heritage.</p>
  
  <h3>Historical Adventure</h3>
  <p>The film beautifully depicts ancient Japan, from primitive settlements to mythical creatures. The attention to historical detail creates an educational experience that brings the past to life in an entertaining way.</p>
  
  <h3>Mythical Elements and Fantasy</h3>
  <p>The story blends historical adventure with fantasy elements, including encounters with legendary creatures and ancient spirits. This combination creates a unique narrative that appeals to fans of both history and fantasy.</p>
  
  <h3>Cultural Appreciation</h3>
  <p>Through their adventure in ancient Japan, the characters (and viewers) gain a deeper appreciation for Japanese culture and heritage. The film subtly teaches about tradition, respect for nature, and the importance of preserving cultural heritage.</p>',
  'Travel back to ancient Japan with Doraemon for a historical adventure filled with culture and mythology.',
  'Doraemon, Birth of Japan, ancient times, historical adventure, mythology, cultural heritage, tradition'
),
(
  8,
  'Great Adventure in the Antarctic Kachi Kochi - Ice-Cold Thrills Return',
  '<h2>Return to the Frozen Frontier</h2>
  <p>The Great Adventure in the Antarctic Kachi Kochi brings back the excitement of polar exploration with new mysteries, greater challenges, and deeper character development in one of the series most thrilling adventures.</p>
  
  <h3>Enhanced Antarctic Experience</h3>
  <p>Building on previous Antarctic adventures, this film takes the icy setting to new heights with more detailed environments, greater dangers, and more spectacular discoveries beneath the frozen landscape.</p>
  
  <h3>Advanced Animation and Effects</h3>
  <p>The improved animation brings the harsh beauty of Antarctica to life with stunning detail. Ice formations, blizzards, and underground caverns are rendered with breathtaking realism that immerses viewers in the environment.</p>
  
  <h3>Deeper Mysteries</h3>
  <p>The ancient mysteries hidden beneath the Antarctic ice are more complex and engaging than ever, providing a compelling narrative that keeps audiences engaged while delivering important messages about exploration and discovery.</p>',
  'Experience enhanced Antarctic thrills in this spectacular return to the frozen frontier of adventure.',
  'Doraemon, Antarctic adventure, ice exploration, mystery, frozen frontier, animation excellence'
),
(
  9,
  'Chronicles of the Moon Exploration - Lunar Wonders Await',
  '<h2>A Magical Journey to the Moon</h2>
  <p>Doraemon: Nobita Chronicles of the Moon Exploration takes viewers on an extraordinary lunar adventure that combines space exploration with whimsical fantasy, creating one of the most imaginative entries in the series.</p>
  
  <h3>The Secret Moon Civilization</h3>
  <p>The discovery of a rabbit civilization on the moon brings Japanese folklore into the space age, creating a delightful blend of traditional culture and futuristic adventure that is both entertaining and educational.</p>
  
  <h3>Space Exploration Themes</h3>
  <p>The film captures the wonder and excitement of space exploration while making it accessible to young audiences. Scientific concepts are woven into the adventure in ways that inspire curiosity about space and astronomy.</p>
  
  <h3>Environmental Messages</h3>
  <p>Through the moon civilization story, the film delivers important messages about environmental protection and coexistence, showing how different species can live together in harmony on their celestial home.</p>
  
  <h3>Visual Spectacle</h3>
  <p>The lunar landscapes and rabbit civilization are brought to life with stunning animation that creates a sense of wonder and magic. Every frame captures the beauty and mystery of our celestial neighbor.</p>',
  'Explore the magical moon and discover its secret rabbit civilization in this lunar adventure.',
  'Doraemon, Moon exploration, lunar adventure, rabbit civilization, space exploration, Japanese folklore'
),
(
  10,
  'Little Star Wars 2021 - A Spectacular Space Opera Remake',
  '<h2>Classic Adventure Reborn</h2>
  <p>Doraemon: Nobita Little Star Wars 2021 breathes new life into a classic space adventure with updated animation, enhanced storytelling, and modern production values while maintaining the heart and soul of the original.</p>
  
  <h3>Enhanced Visual Spectacle</h3>
  <p>The 2021 remake features state-of-the-art animation that brings the space battles and alien worlds to life with unprecedented detail and excitement. Every laser blast, spaceship, and alien landscape is rendered with stunning clarity.</p>
  
  <h3>Modernized Storytelling</h3>
  <p>While staying true to the original story, the remake incorporates modern storytelling techniques and pacing that appeal to contemporary audiences while respecting the classic narrative that fans love.</p>
  
  <h3>Epic Space Battles</h3>
  <p>The space battle sequences are truly spectacular, combining intense action with the series characteristic humor and heart. The battles feel epic in scale while remaining accessible to family audiences.</p>
  
  <h3>Nostalgic Yet Fresh</h3>
  <p>The film successfully balances nostalgia for the original with fresh elements that make it relevant for new generations. Long-time fans will appreciate the faithful adaptation while newcomers will be drawn into the exciting space opera.</p>',
  'Experience the spectacular remake of a classic space adventure with modern animation and timeless storytelling.',
  'Doraemon, Little Star Wars, space opera, remake, modern animation, space battle, classic adventure'
);

-- Insert initial cron jobs
INSERT OR IGNORE INTO cron_jobs (job_name, next_run) VALUES 
('generate_daily_blogs', datetime('now', '+1 day')),
('cleanup_expired_sessions', datetime('now', '+1 hour')),
('update_movie_analytics', datetime('now', '+6 hours')),
('cache_cleanup', datetime('now', '+12 hours'));
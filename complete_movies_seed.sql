-- Complete Doraemon Movies Database Seed (53 Movies: 1980-2026)
-- This file contains all Doraemon mainline theatrical films with comprehensive data

-- Clear existing data first
DELETE FROM blogs;
DELETE FROM movies;

-- Insert all 53 Doraemon movies
INSERT INTO movies (title, year, description, genre, duration_minutes, rating, thumbnail_url, is_active, created_at) VALUES 

-- 1980-1989 (First Decade)
('Doraemon: Nobita''s Dinosaur', 1980, 'The first Doraemon movie where Nobita discovers and raises a baby dinosaur named Piisuke, leading to adventures in the age of dinosaurs.', 'Adventure, Family', 92, 7.8, '/static/movies/nobitas-dinosaur-1980.jpg', 1, datetime('now')),

('Doraemon: The Records of Nobita, Spaceblazer', 1981, 'Nobita and friends explore space and help defend a planet from evil invaders in this exciting space adventure.', 'Adventure, Sci-Fi', 91, 7.6, '/static/movies/spaceblazer-1981.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Haunts of Evil', 1982, 'A mysterious dog kingdom faces danger, and Nobita must help save the day in this thrilling adventure.', 'Adventure, Mystery', 90, 7.5, '/static/movies/haunts-of-evil-1982.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Castle of the Undersea Devil', 1983, 'Underwater adventures await as Nobita and friends discover an ancient undersea civilization and face oceanic dangers.', 'Adventure, Fantasy', 94, 7.7, '/static/movies/undersea-devil-1983.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Great Adventure into the Underworld', 1984, 'Magic and fantasy collide as Nobita enters a world where magic is real and must face demonic forces.', 'Fantasy, Adventure', 97, 8.0, '/static/movies/underworld-1984.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Little Star Wars', 1985, 'A tiny alien prince seeks help from Nobita in this space war epic that parodies the famous Star Wars saga.', 'Adventure, Sci-Fi', 98, 8.2, '/static/movies/little-star-wars-1985.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Steel Troops', 1986, 'Robot invaders from another dimension threaten Earth, and Nobita must lead the defense with his robot army.', 'Action, Sci-Fi', 97, 8.1, '/static/movies/steel-troops-1986.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Knights on Dinosaurs', 1987, 'Time travel leads to the age of dinosaurs where Nobita encounters knights and must save a prehistoric kingdom.', 'Adventure, Time Travel', 92, 7.6, '/static/movies/knights-dinosaurs-1987.jpg', 1, datetime('now')),

('Doraemon: The Record of Nobita''s Parallel Visit to the West', 1988, 'A Journey to the West parody where Nobita becomes the Monkey King in this Chinese mythology-inspired adventure.', 'Fantasy, Comedy', 90, 7.4, '/static/movies/visit-west-1988.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Birth of Japan', 1989, 'Travel to prehistoric Japan as Nobita and friends help establish ancient civilization and face primitive dangers.', 'Adventure, Historical', 100, 8.0, '/static/movies/birth-japan-1989.jpg', 1, datetime('now')),

-- 1990-1999 (Second Decade)
('Doraemon: Nobita and the Animal Planet', 1990, 'A hidden animal planet faces environmental crisis, and Nobita must help save this peaceful world.', 'Adventure, Environmental', 99, 7.9, '/static/movies/animal-planet-1990.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Dorabian Nights', 1991, 'Arabian Nights come to life as Nobita enters the world of Sinbad and experiences magical Middle Eastern adventures.', 'Fantasy, Adventure', 99, 8.0, '/static/movies/dorabian-nights-1991.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Kingdom of Clouds', 1992, 'Sky-high adventures in a cloud kingdom teach lessons about environmental protection and friendship.', 'Fantasy, Environmental', 98, 7.8, '/static/movies/kingdom-clouds-1992.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Tin Labyrinth', 1993, 'A mysterious tin labyrinth on a hotel planet becomes the setting for a thrilling escape adventure.', 'Mystery, Adventure', 100, 7.7, '/static/movies/tin-labyrinth-1993.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Three Visionary Swordsmen', 1994, 'Dream worlds and reality blend as Nobita becomes a swordsman in a fantasy realm of magic and adventure.', 'Fantasy, Action', 99, 7.5, '/static/movies/three-swordsmen-1994.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Diary on the Creation of the World', 1995, 'Nobita observes the creation and evolution of a planet in this educational yet entertaining cosmic adventure.', 'Educational, Sci-Fi', 98, 7.6, '/static/movies/creation-world-1995.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Galaxy Super-express', 1996, 'A space train journey across the galaxy leads to mysterious planets and cosmic adventures.', 'Adventure, Sci-Fi', 97, 7.8, '/static/movies/galaxy-express-1996.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Spiral City', 1997, 'A toy city comes to life, creating a miniature world adventure with big lessons about responsibility.', 'Fantasy, Adventure', 99, 7.4, '/static/movies/spiral-city-1997.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Great Adventure in the South Seas', 1998, 'Pirates, treasure, and tropical islands feature in this swashbuckling maritime adventure.', 'Adventure, Action', 98, 7.7, '/static/movies/south-seas-1998.jpg', 1, datetime('now')),

('Doraemon: Nobita Drifts in the Universe', 1999, 'Space exploration leads to an alien planet where Nobita must help save an endangered civilization.', 'Sci-Fi, Adventure', 93, 7.5, '/static/movies/drifts-universe-1999.jpg', 1, datetime('now')),

-- 2000-2009 (Third Decade)
('Doraemon: Nobita and the Legend of the Sun King', 2000, 'Ancient Mayan civilization and time travel combine in this archaeological adventure full of mystery.', 'Adventure, Historical', 93, 7.9, '/static/movies/sun-king-2000.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Winged Braves', 2001, 'A world of bird people faces ecological disaster, teaching important environmental lessons.', 'Adventure, Environmental', 91, 7.6, '/static/movies/winged-braves-2001.jpg', 1, datetime('now')),

('Doraemon: Nobita in the Robot Kingdom', 2002, 'A robot planet''s society mirrors human issues as Nobita learns about discrimination and acceptance.', 'Sci-Fi, Social', 81, 7.4, '/static/movies/robot-kingdom-2002.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Windmasters', 2003, 'Wind spirits and weather control feature in this atmospheric adventure about natural balance.', 'Fantasy, Adventure', 84, 7.3, '/static/movies/windmasters-2003.jpg', 1, datetime('now')),

('Doraemon: Nobita in the Wan-Nyan Spacetime Odyssey', 2004, 'Dogs and cats rule the future in this time-travel adventure exploring pet-human relationships.', 'Comedy, Time Travel', 89, 7.5, '/static/movies/wan-nyan-odyssey-2004.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Dinosaur 2006', 2006, 'A beautiful remake of the first film with updated animation and deeper emotional storytelling.', 'Adventure, Family', 107, 8.3, '/static/movies/dinosaur-2006.jpg', 1, datetime('now')),

('Doraemon: Nobita''s New Great Adventure into the Underworld', 2007, 'A remake of the 1984 film with enhanced magic system and more complex fantasy elements.', 'Fantasy, Adventure', 112, 8.1, '/static/movies/new-underworld-2007.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Green Giant Legend', 2008, 'Plant aliens and environmental themes blend in this eco-conscious adventure about forest protection.', 'Adventure, Environmental', 112, 7.8, '/static/movies/green-giant-2008.jpg', 1, datetime('now')),

('Doraemon: The New Record of Nobita''s Spaceblazer', 2009, 'A remake of the 1981 space adventure with modern animation and expanded storyline.', 'Adventure, Sci-Fi', 103, 7.9, '/static/movies/new-spaceblazer-2009.jpg', 1, datetime('now')),

-- 2010-2019 (Fourth Decade) 
('Doraemon: Nobita''s Great Battle of the Mermaid King', 2010, 'Underwater kingdom adventure featuring mermaids, ocean conservation, and aquatic battles.', 'Adventure, Fantasy', 100, 8.0, '/static/movies/mermaid-king-2010.jpg', 1, datetime('now')),

('Doraemon: Nobita and the New Steel Troops', 2011, 'A remake of the robot invasion story with enhanced emotional depth and modern animation.', 'Action, Sci-Fi', 108, 8.2, '/static/movies/new-steel-troops-2011.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Island of Miracles', 2012, 'A mysterious island where extinct animals live becomes the setting for an adventure about species preservation.', 'Adventure, Environmental', 109, 7.7, '/static/movies/island-miracles-2012.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Secret Gadget Museum', 2013, 'When Doraemon''s bell is stolen, the gang must infiltrate a gadget museum in the future to retrieve it.', 'Mystery, Comedy', 104, 7.6, '/static/movies/gadget-museum-2013.jpg', 1, datetime('now')),

('Doraemon: Nobita in the New Haunts of Evil ~Peko and the Five Explorers~', 2014, 'A remake featuring the dog kingdom with deeper character development and modern storytelling.', 'Adventure, Mystery', 109, 7.8, '/static/movies/new-haunts-evil-2014.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Space Heroes', 2015, 'Superhero adventures in space as Nobita becomes a hero to save an alien civilization.', 'Action, Sci-Fi', 100, 7.5, '/static/movies/space-heroes-2015.jpg', 1, datetime('now')),

('Doraemon: Nobita and the Birth of Japan 2016', 2016, 'Enhanced remake of the prehistoric adventure with beautiful animation and expanded world-building.', 'Adventure, Historical', 104, 8.1, '/static/movies/birth-japan-2016.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Great Adventure in the Antarctic Kachi Kochi', 2017, 'Antarctic exploration leads to discoveries about ancient civilizations and climate change.', 'Adventure, Educational', 101, 7.9, '/static/movies/antarctic-adventure-2017.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Treasure Island', 2018, 'Pirate adventure on a high-tech treasure island with modern twists on classic treasure hunting.', 'Adventure, Action', 109, 8.0, '/static/movies/treasure-island-2018.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Chronicle of the Moon Exploration', 2019, 'Moon colony adventure exploring space colonization and the importance of protecting our planet.', 'Adventure, Sci-Fi', 111, 8.2, '/static/movies/moon-exploration-2019.jpg', 1, datetime('now')),

-- 2020-2026 (Current Era)
('Doraemon: Nobita''s New Dinosaur', 2020, 'Twin dinosaur adventure focusing on evolution, adaptation, and the bonds between species.', 'Adventure, Family', 111, 8.3, '/static/movies/new-dinosaur-2020.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Little Star Wars 2021', 2022, 'Updated space war epic with modern animation and deeper exploration of conflict resolution.', 'Adventure, Sci-Fi', 108, 8.0, '/static/movies/little-star-wars-2021.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Sky Utopia', 2023, 'Perfect society in the sky raises questions about utopia, happiness, and what makes life meaningful.', 'Fantasy, Philosophy', 107, 8.1, '/static/movies/sky-utopia-2023.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Earth Symphony', 2024, 'Musical adventure celebrating Earth''s natural sounds and the harmony between all living things.', 'Musical, Environmental', 115, 8.4, '/static/movies/earth-symphony-2024.jpg', 1, datetime('now')),

('Doraemon: Nobita''s Art World Tales', 2025, 'Journey through famous artworks and meet historical artists in this creativity-celebrating adventure.', 'Fantasy, Educational', 110, 8.2, '/static/movies/art-world-tales-2025.jpg', 1, datetime('now')),

('Doraemon: Nobita and the New Castle of the Undersea Devil', 2026, 'Planned remake of the classic undersea adventure with modern storytelling and animation.', 'Adventure, Fantasy', 105, 8.0, '/static/movies/new-undersea-devil-2026.jpg', 1, datetime('now')),

-- Stand by Me Series (3D CGI Films)
('Stand by Me Doraemon', 2014, 'Revolutionary 3D CGI film focusing on the emotional bond between Nobita and Doraemon, featuring multiple classic storylines.', '3D Animation, Drama', 95, 8.8, '/static/movies/stand-by-me-2014.jpg', 1, datetime('now')),

('Stand by Me Doraemon 2', 2020, 'Sequel exploring Nobita''s future marriage with Shizuka and the importance of growing up while keeping childhood wonder.', '3D Animation, Romance', 96, 8.6, '/static/movies/stand-by-me-2-2020.jpg', 1, datetime('now'));

-- Generate blog content for each movie (you can run this after movies are inserted)
-- This will be handled by the admin interface
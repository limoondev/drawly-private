-- Enable Supabase Realtime for necessary tables

-- Enable realtime for rooms
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Enable realtime for players
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for canvas strokes
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_strokes;

-- Enable realtime for game events
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

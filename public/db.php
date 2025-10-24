<?php
// DB connection and init (SQLite)
$dbFile = __DIR__ . '/../storage/pegasus.db';
$need_init = !file_exists($dbFile);
try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die('DB error: ' . $e->getMessage());
}
if ($need_init) {
    $db->exec("""
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stream_id TEXT UNIQUE NOT NULL,
      url TEXT NOT NULL,
      logo TEXT,
      category TEXT,
      is_vod INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS vod (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      poster TEXT
    );
    """);
    // insert default admin
    $admin = getenv('ADMIN_USER') ?: 'admin';
    $pass = getenv('ADMIN_PASS') ?: 'admin';
    $stmt = $db->prepare("INSERT OR IGNORE INTO users (username,password,is_admin,active) VALUES (?,?,1,1)");
    $stmt->execute([$admin, $pass]);
}
?>
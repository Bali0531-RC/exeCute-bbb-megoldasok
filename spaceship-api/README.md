# Spaceship Leaderboard API

Node.js + Express + MongoDB backend API a spaceship játék leaderboardjához.

## Telepítés

```bash
cd spaceship-api
npm install
```

## Környezeti változók

Készíts egy `.env` fájlt (opcionális):

```env
PORT=4000
MONGODB_URI=mongodb+srv://execute:execute1@execute.kynqg2f.mongodb.net/?retryWrites=true&w=majority&appName=execute
```

Ha nincs `.env`, az alapértelmezett értékeket használja.

## Futtatás

### Development módban (auto-reload):
```bash
npm run dev
```

### Production módban:
```bash
npm start
```

Az API a **4000-es porton** indul el.

## Endpoints

### Health Check
```
GET /health
```
Válasz:
```json
{
  "status": "ok",
  "message": "Spaceship Leaderboard API is running",
  "database": "connected",
  "timestamp": "2025-10-03T12:00:00.000Z"
}
```

### Get Leaderboard
```
GET /leaderboard?limit=10
```
Paraméterek:
- `limit` (opcionális): Hány eredményt kérsz (alapértelmezett: 10)

Válasz:
```json
[
  {
    "name": "Player1",
    "moves": 12,
    "timestamp": "2025-10-03T12:00:00.000Z"
  },
  ...
]
```

### Submit Score
```
POST /leaderboard
Content-Type: application/json

{
  "name": "Player1",
  "moves": 15,
  "timestamp": "2025-10-03T12:00:00.000Z"
}
```

Válasz sikeres submit esetén:
```json
{
  "message": "Score updated successfully",
  "record": {...},
  "updated": true
}
```

Ha a létező rekord jobb:
```json
{
  "message": "Score not updated - existing score is better or equal",
  "current": {...},
  "updated": false
}
```

### Get Player Rank
```
GET /rank/:name
```

Példa: `GET /rank/Player1`

Válasz:
```json
{
  "name": "Player1",
  "moves": 12,
  "rank": 3,
  "timestamp": "2025-10-03T12:00:00.000Z"
}
```

### Delete Player (Admin)
```
DELETE /leaderboard/:name
```

## Nginx Proxy Konfiguráció

Az `api.plexdev.live` domainhez add hozzá az nginx configban:

```nginx
server {
    listen 80;
    server_name api.plexdev.live;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

HTTPS-hez (certbot):
```bash
sudo certbot --nginx -d api.plexdev.live
```

## PM2-vel való futtatás (production)

```bash
# Globálisan telepítsd a PM2-t
npm install -g pm2

# Indítsd el az API-t
pm2 start server.js --name spaceship-api

# Auto-restart boot-kor
pm2 startup
pm2 save

# Logs megtekintése
pm2 logs spaceship-api

# Restart
pm2 restart spaceship-api

# Stop
pm2 stop spaceship-api
```

## Adatbázis

MongoDB Atlas:
- Database: `spaceship_game`
- Collection: `leaderboard`
- Indexes:
  - `moves` (ascending) - gyors rendezéshez
  - `name` (unique) - duplikátumok elkerülésére

## CORS

Az API minden origin-t elfogad (`Access-Control-Allow-Origin: *`), szükség esetén korlátozd le production környezetben.

## Hibaelhárítás

### MongoDB connection error
- Ellenőrizd a MongoDB URI-t
- Nézd meg, hogy az IP whitelisted-e a MongoDB Atlas-ban

### Port already in use
```bash
# Nézd meg mi használja a 4000-es portot
lsof -i :4000

# Vagy változtasd meg a portot a .env-ben
PORT=4001 npm start
```

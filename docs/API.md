# API-dokumentation för frontend

Den här filen beskriver de backend-endpoints som frontend kan använda i PortföljLab.

Base URL lokalt:

```text
http://localhost:3000
```

Frontend ska inte anropa CoinGecko direkt. All prisdata, historik och trading-logik går via våra egna backend-routes.

---

## Auth

### Register

```http
POST /api/auth/register
```

Skapar en ny användare och loggar in användaren direkt genom att sätta en HttpOnly-cookie.

Body:

```json
{
  "name": "fjs",
  "email": "fjs@test.se",
  "password": "12345678"
}
```

Exempel på lyckat svar:

```json
{
  "message": "Registrering och inloggning lyckades",
  "user": {
    "id": "user-id",
    "name": "fjs",
    "email": "fjs@test.se"
  }
}
```

---

### Login

```http
POST /api/auth/login
```

Loggar in användaren och sätter en HttpOnly-cookie med JWT-token.

Body:

```json
{
  "email": "fjs@test.se",
  "password": "12345678"
}
```

Exempel på lyckat svar:

```json
{
  "message": "Inloggning lyckades",
  "user": {
    "id": "user-id",
    "name": "fjs",
    "email": "fjs@test.se"
  }
}
```

---

### Logout

```http
POST /api/auth/logout
```

Loggar ut användaren genom att ta bort cookien `token`.

Exempel på svar:

```json
{
  "message": "Utloggning lyckades"
}
```

---

### Current user

```http
GET /api/auth/me
```

Kontrollerar om användaren är inloggad.

Exempel på lyckat svar:

```json
{
  "id": "user-id",
  "email": "fjs@test.se",
  "name": "fjs"
}
```

Om användaren inte är inloggad returneras `401`.

---

## Assets

### Hämta alla aktiva kryptovalutor

```http
GET /api/assets
```

Returnerar kryptovalutor från databasen utan prisdata.

Exempel på svar:

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "asset-id",
      "coingeckoId": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "imageUrl": "https://...",
      "isActive": true,
      "createdAt": "2026-..."
    }
  ]
}
```

---

### Hämta kryptovalutor med aktuella priser

```http
GET /api/assets/prices
```

Returnerar aktiva kryptovalutor tillsammans med aktuellt pris från cache/CoinGecko.

Frontend bör använda denna endpoint på Market-sidan.

Exempel på svar:

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "asset-id",
      "coingeckoId": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "imageUrl": "https://...",
      "priceSek": "700000",
      "change24h": "2.35",
      "priceUpdatedAt": "2026-...",
      "source": "cache"
    }
  ]
}
```

`source` kan vara:

```text
cache
coingecko
fallback-cache
```

---

### Hämta historisk prisdata för graf

```http
GET /api/assets/[id]/history?days=7
```

`[id]` är vårt interna `assetId` från databasen.

Tillåtna perioder:

```text
1
7
30
365
```

Exempel:

```http
GET /api/assets/asset-id/history?days=7
```

Exempel på svar:

```json
{
  "success": true,
  "asset": {
    "id": "asset-id",
    "name": "Bitcoin",
    "symbol": "BTC",
    "coingeckoId": "bitcoin"
  },
  "days": 7,
  "data": [
    {
      "timestamp": 1779465655768,
      "date": "2026-05-22",
      "time": "14:20",
      "price": 717661.13
    }
  ]
}
```

Den här datan är formaterad för Recharts.

Frontend kan använda:

```text
date eller time på x-axeln
price på y-axeln
```

---

## Trades

### Köp kryptovaluta

```http
POST /api/trades/buy
```

Kräver inloggad användare.

Frontend skickar belopp i SEK. Backend räknar själv ut quantity baserat på aktuellt pris.

Body:

```json
{
  "assetId": "asset-id",
  "amountSek": 1000
}
```

Exempel på lyckat svar:

```json
{
  "message": "Köp genomfört.",
  "data": {
    "asset": {
      "id": "asset-id",
      "name": "Bitcoin",
      "symbol": "BTC"
    },
    "buy": {
      "amountSek": "1000",
      "priceSek": "700000",
      "quantity": "0.001428571428"
    },
    "holding": {
      "id": "holding-id",
      "quantity": "0.001428571428",
      "averageBuyPrice": "700000"
    },
    "user": {
      "id": "user-id",
      "cashBalance": "99000"
    },
    "transaction": {
      "id": "transaction-id",
      "type": "BUY",
      "totalSek": "1000",
      "createdAt": "2026-..."
    }
  }
}
```

---

### Sälj kryptovaluta

```http
POST /api/trades/sell
```

Kräver inloggad användare.

Frontend skickar quantity. Backend räknar själv ut totalSek baserat på aktuellt pris.

Body:

```json
{
  "assetId": "asset-id",
  "quantity": 0.001
}
```

Exempel på lyckat svar:

```json
{
  "message": "Försäljning genomförd.",
  "data": {
    "asset": {
      "id": "asset-id",
      "name": "Bitcoin",
      "symbol": "BTC"
    },
    "sell": {
      "quantity": "0.001",
      "priceSek": "700000",
      "totalSek": "700"
    },
    "holding": {
      "id": "holding-id",
      "status": "updated",
      "remainingQuantity": "0.002"
    },
    "user": {
      "id": "user-id",
      "cashBalance": "99700"
    },
    "transaction": {
      "id": "transaction-id",
      "type": "SELL",
      "totalSek": "700",
      "createdAt": "2026-..."
    }
  }
}
```

`holding.status` kan vara:

```text
updated = holding finns kvar men quantity har minskat
deleted = användaren sålde allt och holding togs bort
```

---

## Portfolio

### Hämta användarens portfölj

```http
GET /api/portfolio
```

Kräver inloggad användare.

Returnerar saldo, innehav, aktuellt värde, totalt portföljvärde och vinst/förlust.

Exempel på svar:

```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "name": "Aida",
    "email": "aida@test.se"
  },
  "summary": {
    "cashBalance": "93000",
    "totalHoldingsValueSek": "7000",
    "totalPortfolioValueSek": "100000",
    "totalInvestedSek": "6500",
    "totalProfitLossSek": "500",
    "totalProfitLossPercent": "7.69"
  },
  "holdings": [
    {
      "id": "holding-id",
      "asset": {
        "id": "asset-id",
        "coingeckoId": "bitcoin",
        "symbol": "BTC",
        "name": "Bitcoin",
        "imageUrl": "https://..."
      },
      "quantity": "0.01",
      "averageBuyPrice": "650000",
      "currentPriceSek": "700000",
      "currentValueSek": "7000",
      "investedValueSek": "6500",
      "profitLossSek": "500",
      "profitLossPercent": "7.69",
      "updatedAt": "2026-..."
    }
  ]
}
```

---

## Test endpoints

### Health check

```http
GET /api/health
```

Kontrollerar att backend kan ansluta till databasen.

Exempel på svar:

```json
{
  "status": "ok",
  "database": "connected",
  "userCount": 1
}
```

---

### Testa CoinGecko

```http
GET /api/test-coingecko
```

Testar att backend kan hämta priser från CoinGecko.

Denna endpoint används bara under utveckling och behöver inte användas i frontend.

---

## Viktigt för frontend

Auth använder HttpOnly-cookie. Frontend ska därför inte spara JWT-token i localStorage.

Vid fetch-anrop kan det behövas:

```ts
credentials: "include"
```

Exempel:

```ts
const response = await fetch("/api/portfolio", {
  credentials: "include",
});
```

För Market-sidan används främst:

```http
GET /api/assets/prices
```

För graf används:

```http
GET /api/assets/[id]/history?days=7
```

För köp används:

```http
POST /api/trades/buy
```

För sälj används:

```http
POST /api/trades/sell
```

För dashboard/portfolio används:

```http
GET /api/portfolio
```
## Transactions

### Hämta användarens transaktionshistorik

```http
GET /api/transactions
```

Kräver att användaren är inloggad.

Den här endpointen hämtar tidigare köp och sälj för den inloggade användaren. Backend läser användarens `userId` från JWT-token i HttpOnly-cookien och hämtar endast transaktioner som tillhör den användaren.

Transaktionerna sorteras med senaste först.

Exempel på lyckat svar:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "transaction-id",
      "type": "SELL",
      "asset": {
        "id": "asset-id",
        "coingeckoId": "bitcoin",
        "symbol": "BTC",
        "name": "Bitcoin",
        "imageUrl": "https://..."
      },
      "quantity": "0.001",
      "priceSek": "700000",
      "totalSek": "700",
      "createdAt": "2026-05-29T12:00:00.000Z"
    },
    {
      "id": "transaction-id",
      "type": "BUY",
      "asset": {
        "id": "asset-id",
        "coingeckoId": "bitcoin",
        "symbol": "BTC",
        "name": "Bitcoin",
        "imageUrl": "https://..."
      },
      "quantity": "0.001428571428",
      "priceSek": "700000",
      "totalSek": "1000",
      "createdAt": "2026-05-29T11:50:00.000Z"
    }
  ]
}
```

Om användaren inte har några transaktioner returneras en tom lista:

```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

Om användaren inte är inloggad returneras status `401`.

Frontend kan använda denna endpoint för att visa en transaktionstabell på Dashboard eller Portfolio-sidan med köp, sälj, datum, symbol, quantity, pris och totalbelopp.

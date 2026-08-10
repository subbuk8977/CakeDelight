# Cake Delight Simple Frontend

Plain HTML + CSS + JavaScript frontend for testing Cake Delight microservices.

## Gateway

The frontend sends requests to:

http://localhost:8080

It does NOT call ports 4001/4002/4003 directly.

## Routes

### Catalog :4001
GET    /api/catalog/cakes
GET    /api/catalog/cakes/all
GET    /api/catalog/cakes/:id
POST   /api/catalog/cakes
PUT    /api/catalog/cakes/:id
DELETE /api/catalog/cakes/:id

### Basket / Order :4002
GET    /api/basket/:userId
POST   /api/basket/:userId/items
PUT    /api/basket/:userId/items/:cakeId
DELETE /api/basket/:userId/items/:cakeId

POST   /api/orders/checkout
GET    /api/orders/detail/:orderId
GET    /api/orders/:userId
GET    /api/orders/check-purchase/:userId/:cakeId

### Rating :4003
POST /api/ratings
GET  /api/ratings/:cakeId/average
GET  /api/ratings/:cakeId

## Run

Because this is plain HTML/CSS/JS, there is no npm install.

Recommended: VS Code Live Server extension.

1. Open this folder in VS Code.
2. Right-click index.html.
3. Select "Open with Live Server".
4. Browser opens on something like:
   http://127.0.0.1:5500

Make sure:
- Catalog service is running on 4001
- Order/Basket service is running on 4002
- Rating service is running on 4003
- Notification service is running on 4004
- Express Gateway is running on 8080
- Gateway CORS is enabled

## Important

If your Express Gateway uses a different public route or your service expects a different JSON body, update js/*.js accordingly.

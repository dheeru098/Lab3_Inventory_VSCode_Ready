# Inventory and Data Management System

**Web Dev III — Assignment 3 | Unit 3**

This is the REST API required by the lab. It manages a MongoDB product collection with validation, product CRUD, inventory search and filtering, atomic stock adjustments, and two reporting endpoints. As shown in the assignment's Postman screenshots, the project is a backend API, not a website.

## Open in Visual Studio Code

1. Extract the ZIP completely. Do not try to run the project from inside the ZIP.
2. Double-click `OPEN_IN_VS_CODE.cmd` in the extracted project folder. Alternatively, double-click `Lab3_Inventory.code-workspace` or open that file from VS Code with **File → Open Workspace from File**.
3. Have Node.js and MongoDB ready. Node.js provides the `node` and `npm` commands. MongoDB can be installed locally or hosted through MongoDB Atlas.

## Run on Windows

**Easiest way:** Double-click `START_SERVER.cmd`. It creates `.env` from `.env.example` if necessary, installs the three allowed dependencies with `npm install`, and starts the API.

**Or use the VS Code terminal:**

```cmd
copy .env.example .env
npm install
npm start
```

If `.env` already exists, skip the `copy` command.

The default `.env.example` connects to local MongoDB at `mongodb://127.0.0.1:27017/inventory_lab3`. For MongoDB Atlas, enter your database connection URI as the `MONGODB_URI` value in the local `.env` file. Never upload your actual `.env` file or credentials to GitHub.

The server starts at **http://localhost:5000** after MongoDB connects. Keep the terminal window open while using Postman. To stop the server, press **Ctrl + C**.

## Test in Postman

1. Launch Postman and choose **Import → File**.
2. Import `postman/Inventory_Lab3.postman_collection.json` from the project folder.
3. Run **01 - Create Product**. It saves the new MongoDB `_id` as `productId` for the later requests.
4. Run **02 - Create Low-Stock Furniture** and **03 - Create Electronics** to add other categories.
5. Test **04 - Get All Products**, **05 - Search Filter Sort and Paginate**, **06 - Get One Product**, **07 - Update Product**, **08 - Restock Product**, **09 - Record Sale**, **10 - Low-Stock Report**, and **11 - Category Summary**.
6. Test **12 - Delete Product** last, because it removes the product created in step 3.

If you run the create requests again with the same SKU, the API correctly returns `409 Conflict` because product SKUs are unique.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/products` | Create a product (201 Created) |
| GET | `/api/products` | Get all products with filtering, sorting and pagination |
| GET | `/api/products/:id` | Get a single product by MongoDB ID |
| PUT | `/api/products/:id` | Update product details, including quantity |
| DELETE | `/api/products/:id` | Delete a product |
| PATCH | `/api/products/:id/restock` | Add stock atomically |
| PATCH | `/api/products/:id/sale` | Subtract stock atomically if enough is available |
| GET | `/api/products/low-stock` | Report products at or below their reorder level |
| GET | `/api/products/category-summary` | Aggregate inventory totals by category |

### Sample create request

`POST http://localhost:5000/api/products`

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

This matches the example fields in the lab PDF. The successful response includes `_id`, `createdAt`, `updatedAt`, and calculated `stockValue`, which equals `price × quantity`. In this example it is `4800`.

### Sample inventory queries

```text
GET /api/products?search=pen
GET /api/products?category=Stationery
GET /api/products?minPrice=100&maxPrice=500
GET /api/products?sort=price&page=1&limit=5
GET /api/products?sort=-price
```

Filtering accepts the `search`, `category`, `minPrice`, and `maxPrice` query parameters. Sorting supports `name`, `price`, `quantity`, `category`, `createdAt`, and `sku` (put a minus sign before the field for descending order). Pagination uses `page` and `limit` and returns `total`, `page`, `totalPages`, `count`, and `products`. The maximum page limit is 100.

### Sample stock changes

For `PATCH /api/products/:id/restock` or `PATCH /api/products/:id/sale`, send JSON:

```json
{
  "amount": 5
}
```

The amount must be a positive whole number. A sale that exceeds available stock returns `409 Conflict` and leaves the quantity unchanged. These operations use MongoDB atomic updates to protect concurrent inventory changes.

### Reports

`GET /api/products/low-stock` returns `{ "count": ..., "lowStockItems": [...] }` for products whose `quantity` is less than or equal to `reorderLevel`.

`GET /api/products/category-summary` groups inventory by category using a MongoDB aggregation pipeline. Each category includes `productCount`, `totalQuantity`, `totalStockValue`, and `lowStockProducts`.

## Validation and error handling

The Mongoose product schema checks required fields, unique SKU, nonnegative price and quantity, nonnegative reorder level, and whole-number stock counts. A separate input-validation middleware rejects unknown or empty product payloads and invalid stock adjustments. The centralized error handler returns meaningful errors for invalid JSON, invalid IDs, field validation, and duplicate SKUs.

## Assignment checklist

| PDF requirement | Implementation |
| --- | --- |
| Product schema and field-level validation | `src/models/Product.js` |
| Express and MongoDB connection using dotenv | `server.js`, `.env.example` |
| Create, read, update, and delete APIs | `src/controllers/productController.js`, `src/routes/productRoutes.js` |
| Search, filtering, sorting, pagination | `GET /api/products` |
| Safe stock increase and decrease | `PATCH /api/products/:id/restock`, `PATCH /api/products/:id/sale` |
| Low-stock alert report | `GET /api/products/low-stock` |
| Category-wise MongoDB aggregation | `GET /api/products/category-summary` |
| Input-validation and centralized error middleware | `src/middleware/` |
| API testing that matches the PDF screenshots | `postman/Inventory_Lab3.postman_collection.json` |

The application uses only **Node.js, Express.js, Mongoose, and dotenv**, with MongoDB as its database. There is no prebuilt dashboard, CMS, or inventory boilerplate.

## Common errors

- **`node` or `npm` not recognized:** Install Node.js LTS and restart VS Code.
- **MongoDB connection failed:** Start your local MongoDB server, or use a correct MongoDB Atlas URI in `.env`.
- **Port 5000 already in use:** Change `PORT` in `.env`, and also edit Postman's `baseUrl` variable.
- **409 duplicate SKU:** Change the product's SKU before creating another product.
- **400 invalid ID or bad request:** Check the URL, JSON body, and numeric fields.
- **404 product not found:** First create a product, then use its returned `_id`.

The `node_modules` folder is not supplied in the ZIP and should not be committed to GitHub. Running `npm install` creates it automatically. Actual MongoDB connectivity depends on the database configuration on your own laptop.

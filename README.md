# Wanderlust — Property Listing Web Application

Wanderlust is a full-stack property listing web application inspired by Airbnb. Users can explore properties, create and manage listings, and share reviews.

## Live Demo

https://wanderlust-0ggb.onrender.com/listings

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, Bootstrap, CSS, JavaScript
- **Database:** MongoDB, Mongoose
- **Authentication:** Passport.js, Express Session
- **Image Storage:** Cloudinary
- **Maps:** Mapbox
- **Deployment:** Render

## Features

- User signup, login, and logout
- Authentication and authorization
- Create, edit, and delete property listings
- Image uploads using Cloudinary
- Property search and price filtering
- Pagination
- Interactive property maps
- Add and delete property reviews
- Listing ownership and review author permissions
- Input validation using Joi
- CSRF protection and login rate limiting

## Project Structure

```text
controllers/   - Application logic
models/        - Mongoose models
routes/        - Express routes
views/         - EJS templates
public/        - CSS and JavaScript
utils/         - Helper functions
app.js         - Application entry point
```

## Run Locally

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Create a `.env` file with the required environment variables.
4. Configure MongoDB, Cloudinary, Mapbox, and session secrets.
5. Start the application using `npm start`.
6. Open `http://localhost:8080/listings`.

## Author

Rakesh Kavara

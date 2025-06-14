
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const session = require('express-session');
const regd_users = express.Router();
const public_users = express.Router();

let users = [
  { username: "vijay", password: "mypassword123" }
];



regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user exists and password is correct
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT
    const accessToken = jwt.sign(
        { username: user.username },
        "access", // This matches the secret used in your auth middleware
        { expiresIn: '1h' }
    );

    // Save token in session
    req.session.authorization = {
        accessToken,
        username: user.username
    };

    return res.status(200).json({ message: "Login successful", token: accessToken });
});

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if reviews exist and the user has one
    if (
        books[isbn].reviews &&
        books[isbn].reviews.hasOwnProperty(username)
    ) {
        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully",
            reviews: books[isbn].reviews,
        });
    } else {
        return res.status(404).json({ message: "Review not found for user" });
    }
});

// Add a book review
// Add/modify a review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Get username from session (set during login)
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review query is missing" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // If no reviews yet, initialize
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});




module.exports.authenticated = regd_users;

module.exports.isValid = isValid;
module.exports.users = users;

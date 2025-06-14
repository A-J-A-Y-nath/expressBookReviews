const axios = require("axios");
const jwt = require("jsonwebtoken");
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.get("/asyncbooks", async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return res.status(200).json({
            message: "Books fetched using async/await",
            data: response.data
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

public_users.get("/asyncisbn/:isbn", async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get("http://localhost:5000/");
        const books = response.data;

        if (books[isbn]) {
            res.status(200).json({
                message: `Book details for ISBN ${isbn}`,
                book: books[isbn],
            });
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book", error: error.message });
    }
});

public_users.get("/asyncauthor/:author", async (req, res) => {
    const authorQuery = req.params.author;

    try {
        const response = await axios.get("http://localhost:5000/");
        const books = response.data;

        const matchedBooks = [];

        for (const key in books) {
            if (books[key].author.toLowerCase() === authorQuery.toLowerCase()) {
                matchedBooks.push({
                    isbn: key,
                    title: books[key].title,
                    reviews: books[key].reviews
                });
            }
        }

        if (matchedBooks.length > 0) {
            res.status(200).json({
                message: `Books by author: ${authorQuery}`,
                books: matchedBooks
            });
        } else {
            res.status(404).json({ message: "Author not found" });
        }

    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

public_users.get("/asynctitle/:title", async (req, res) => {
    const titleQuery = req.params.title;

    try {
        const response = await axios.get("http://localhost:5000/");
        const books = response.data;

        const matchedBooks = [];

        for (const key in books) {
            if (books[key].title.toLowerCase() === titleQuery.toLowerCase()) {
                matchedBooks.push({
                    isbn: key,
                    author: books[key].author,
                    reviews: books[key].reviews
                });
            }
        }

        if (matchedBooks.length > 0) {
            res.status(200).json({
                message: `Books with title: ${titleQuery}`,
                books: matchedBooks
            });
        } else {
            res.status(404).json({ message: "Title not found" });
        }

    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Register new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4))
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        res.send(JSON.stringify(books[isbn], null, 4));
    } else {
        res.status(404).json({ message: "Book not found for the given ISBN" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author;
    const matchingBooks = [];

    // Get all keys from the books object
    const bookKeys = Object.keys(books);

    // Loop through books and find matching authors
    bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
            matchingBooks.push({ isbn: key, ...books[key] });
        }
    });

    if (matchingBooks.length > 0) {
        res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
        res.status(404).json({ message: "No books found for the given author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const titleName = req.params.title;
    const matchingBooks = [];

    const bookKeys = Object.keys(books);

    bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === titleName.toLowerCase()) {
            matchingBooks.push({ isbn: key, ...books[key] });
        }
    });

    if (matchingBooks.length > 0) {
        res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
        res.status(404).json({ message: "No books found for the given title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        res.send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        res.status(404).json({ message: "Book not found for the given ISBN" });
    }
});
public_users.post("/customer/login", (req, res) => {
    const { username, password } = req.body;

    // Check for empty input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check for valid user
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate token
    const accessToken = jwt.sign(
        { username: user.username },
        'secretKey123', // In real-world apps use env variables
        { expiresIn: '1h' }
    );

    // Save token and user in session
    req.session.authorization = {
        accessToken,
        username: user.username
    };

    return res.status(200).json({ message: "Login successful", token: accessToken });
});

module.exports.general = public_users;

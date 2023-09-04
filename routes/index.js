var express = require('express');
var router = express.Router();
const Book = require('../models').Book;


/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}


router.get('/', (req, res) => {
  res.redirect('/books'); // redirects to books
});


////////////// READ /////////////////////

// Index Route also View All Books
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll({order: [["createdAt", "DESC"]]});
  res.render('index', { books, title: 'Books' });
}));



////////////// CREATE /////////////////////

// New Book Form
router.get('/books/new', asyncHandler(async (req, res) => {

  res.render('new-book', { title: 'New Book' });
}));

// Create New Book
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/'); // Redirect to home after a successful creation
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle validation errors here
      book = await Book.build(req.body);
      res.render('/books/new', { book, errors: error.errors });
    } else {
      throw error; // Unhandled error
    }
  }
}));

////////////// UPDATE /////////////////////

// Update Book Form
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id)
  res.render('update-book', { book, title: book.title });
}));

// Update Book
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/'); // Redirect to home after a successful update
    } else {
      res.sendStatus(404); // Book not found
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle validation errors here
      book = await Book.build(req.body);
      book.id = req.params.id; // preserve id
      res.render('books/' + book.id , { book, errors: error.errors });
    } else {
      throw error; // Unhandled error
    }
  }
}));


////////////// DELETE /////////////////////

// Delete Book
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect('/'); // Redirect to home after a successful deletion
    } else {
      res.render('error', { error: "Book not found" }); // Render a custom error page
    }
  } catch (error) {
    res.render('error', { error }); // Render a custom error page with the caught error
  }
}));



// JSON Route for debugging
router.get('/all', asyncHandler(async (req, res) => {
  const books = await Book.findAll({order: [["createdAt", "DESC"]]});
  res.json(books);
}));

module.exports = router;

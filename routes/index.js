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
      console.log(`SequelizeValidationError caught`)
      // Handle validation errors here

      // Here we are collecting the data that we do have so that we can rerender the form with data
      book = await Book.build(req.body);
      console.log(book)
      res.render('new-book', { book, errors: error.errors });
    } else {
      throw error; // Unhandled error
    }
  }
}));

////////////// UPDATE /////////////////////

// Update Book Form
router.get('/books/:id', asyncHandler(async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id)
    if (book) {
      res.render('update-book', { book, title: book.title });
    }else {
      console.log(`no book found with id: ${req.params.id}`)
      res.render('page-not-found')
    }

  } catch (error) {
    console.log(`unhandled error`)
    console.log(error)
    throw error; // Unhandled error
  }


}));

// Update Book
router.post('/books/:id', asyncHandler(async (req, res) => {
  console.log(`entered post route for book id: ${req.params.id}`)
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/'); // Redirect to home after a successful update
    } else {
      console.log(`no book found with id: ${req.params.id}`)
      res.render('page-not-found')
    }
  } catch (error) {
    console.log(error)
    if (error.name === 'SequelizeValidationError') {
      console.log(`SequelizeValidationError caught`)
      // Handle validation errors here

      // Here we are collecting the data that we do have so that we can rerender the form with data
      // as entered instead of pulled from the db, which would wipe out the user's changes
      book = await Book.build(req.body);
      book.id = req.params.id; // pull in the id from the params to put into the form data
      console.log(book)
      res.render(`update-book`, { book, errors: error.errors });
    } else {
      console.log(`unhandled error`)
      console.log(error)
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

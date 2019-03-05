/*
*
*
*       Complete the API routing below
*       
*       
*/
'use strict';
const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectIdSchema = mongoose.Schema.Types.ObjectId;
const bookSchema = new Schema({
  title: String,
  comments: [{type: ObjectIdSchema, ref: 'Comment'}],
});
const Book = mongoose.model('Book', bookSchema);
const commentSchema = new Schema({
  text: String,
  book: {type: ObjectIdSchema, ref: 'Book'}
});
const Comment = mongoose.model('Comment', commentSchema); 
mongoose.connect(process.env.DB);
module.exports = (app)=>{
  app.route('/api/books')
    .get((req, res)=>{
    //response will be array of book objects
    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    Book.find({},(err, books)=>{
      if(err){return console.error(err)};
      let result = [];
      for (let i=0; i < books.length; i++){
        result.push({
          title: books[i].title, 
          _id: books[i]._id, 
          commentcount: books[i].comments.length
        });
      };
      return res.json(result);
    })
  })
    .post((req, res)=>{
    if(!req.body.title){return res.send('No title given!')};
    let title = req.body.title;
    //response will contain new book object including atleast _id and title
    Book.findOne({title: title}, (err, book)=>{
      if(err){return console.error(err)};
      if(book){return res.send("Book already exists!")};
      book = new Book({title: title});
      book.save();
      return res.json({title: book.title, _id: book._id});
    })
  })
    .delete((req, res)=>{
    //if successful response will be 'complete delete successful'
    Book.deleteMany({}, async (err, books)=>{
      if(err){return console.error(err)};
      await Comment.deleteMany({}, (err, comments)=>{
        if(err){return console.error(err)};
      })
      return res.send("complete delete successful")
    })
  });
  app.route('/api/books/:id')
    .get((req, res)=>{
    let bookid = req.params.id;
    //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    Book.findById(bookid, async (err, book)=>{
      if(err){console.error(err.message);return res.send("Book doesn't exist!")};
      if(!book){return res.send("Book doesn't exist!")}
      let commentstext = [];
      await Comment.find({book: bookid}, (err, comments)=>{
        if(err){return console.error(err)};
        for(let i = 0; i < comments.length; i++){
          commentstext.push(comments[i].text)
        }
      })
      return res.json({title: book.title, _id: book._id, comments: commentstext});
    });
  })
    .post((req, res)=>{
    if(!req.body.comment){console.error("Comment body empty!");return res.send("Comment body empty!")}
    let bookid = req.params.id;
    let commenttext = req.body.comment;
    //json res format same as .get
    Book.findById(bookid, async (err, book)=>{
      if(err){console.error(err.message); return res.send("Book doesn't exist!")};
      if(!book){return res.send("Book doesn't exist!")};
      await Comment.create({text: commenttext, book: bookid}, (err, comment)=>{
        if(err){return console.error(err)}
        book.comments.push(comment);
        book.save(); 
      });
      let commentstext = [];
      await Comment.find({book: bookid}, (err, comments)=>{
        if(err){return console.error(err)};
        for(let i = 0; i < comments.length; i++){
          commentstext.push(comments[i].text)
        }
      })
      return res.json({title: book.title, _id: book._id, comments: commentstext});
    })
  })
    .delete((req, res)=>{
    let bookid = req.params.id;
    //if successful response will be 'delete successful'
    Book.findByIdAndDelete(bookid, async(err, book)=>{
      if(err){return console.error(err)};
      await Comment.deleteMany({book: bookid}, (err, comments)=>{
        if(err){return console.error(err)};
      })
      return res.send('delete successful');
    });
  });
};

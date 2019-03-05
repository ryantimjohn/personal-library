/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);
const create_test_book = (callback)=>{
  let randint = Math.floor(Math.random() * 10000)
  let title = 'test_book'+randint.toString();
  chai.request(server)
    .post('/api/books')
    .send({title: title})
    .end((err, res)=>{
    if(err){return console.error(err)};
    assert.equal(res.status, 200);
    assert.equal(res.body.title, title);
    let bookid = res.body._id;
    callback(bookid); 
  })
}
const cleanup = (bookid, done)=>{
  chai.request(server)
    .delete('/api/books/'+bookid)
    .end((err, res)=>{
    if(err){console.error(err)};
    assert.equal(res.status, 200);
    assert.equal(res.text, 'delete successful');
    done();
  })
}
suite('Functional Tests', ()=>{
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', (done)=>{
    create_test_book((bookid)=>{
      chai.request(server)
        .get('/api/books')
        .end((err, res)=>{
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        cleanup(bookid, done);
      });}   
                    )
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */
  suite('Routing tests', ()=>{
    suite('POST /api/books with title => create book object/expect book object', ()=>{
      test('Test POST /api/books with title', (done)=>{
        chai.request(server)
          .post('/api/books')
          .send({title: 'sample_title'})
          .end((err, res)=>{
          if(err){return console.error(err)};
          assert.equal(res.status, 200);
          assert.equal(res.body.title, 'sample_title');
          let bookid = res.body._id;  
          cleanup(bookid, done);
        }    
              )
      });
      test('Test POST /api/books with no title given', (done)=>{
        chai.request(server)
          .post('/api/books')
          .end((err, res)=>{
          if(err){return console.error(err)};
          assert.equal(res.status, 200);
          assert.equal(res.text, 'No title given!')
          done();
        });
      });
    });
    suite('GET /api/books => array of books', ()=>{
      test('Test GET /api/books',  (done)=>{
        create_test_book((bookid)=>{ 
          chai.request(server)
            .get('/api/books')
            .end((err, res)=>{
            if(err){return console.error(err)}
            assert.isArray(res.body);
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'commentcount');
            cleanup(bookid, done);
          })
        }
                        );
      });      
    });
    suite('GET /api/books/[id] => book object with [id]', ()=>{
      test('Test GET /api/books/[id] with id not in db',  (done)=>{
        chai.request(server)
          .get('/api/books/123')
          .end((err, res)=>{
          if(err){console.error(err.message)};
          assert.equal(res.status, 200);
          assert.equal(res.text, "Book doesn't exist!");
          done();
        }
              )
      });
      test('Test GET /api/books/[id] with valid id in db', (done)=>{
        create_test_book((bookid)=>{
          chai.request(server)
            .get('/api/books/'+bookid)
            .end((err, res)=>{
            if(err){return console.error(err)};
            assert.equal(res.status, 200);
            assert.equal(res.body._id, bookid);
            assert.property(res.body, 'comments');
            assert.isArray(res.body.comments);
            cleanup(bookid, done);  
          })
        })
      });
    });
    suite('POST /api/books/[id] => add comment/expect book object with id', ()=>{
      test('Test POST /api/books/[id] with comment', (done)=>{
        create_test_book((bookid)=>{
          chai.request(server)
            .post('/api/books/'+bookid)
            .send({comment: "This is a test comment."})
            .end((err, res)=>{
            if(err){return console.error(err)};
            assert.equal(res.status, 200);
            assert.equal(res.body.comments.length, 1);
            assert.equal(res.body.comments[0], "This is a test comment.");
            cleanup(bookid, done); 
          });
        });
      });
    });
  });
});

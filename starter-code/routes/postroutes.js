const express    = require('express');
const passport   = require('passport');
const router     = express.Router();
const path       = require('path');
const multer     = require('multer');
const User       = require('../models/user');
const Post       = require('../models/post');
const fs         = require('fs');

const myUploaderPost = multer({
  dest: path.join(__dirname, '../public/uploads')
});

console.log("in postRoutes");

/* router get original

router.get('/',(req,res)=>{
  Post.find((err, post) => {
    if (err) return next(err);
    console.log("in router get / post:");
    console.log(post);

    res.render('post/listpost', {post,user:req.user});
  });*/

  router.get('/',(req,res,next)=>{
    Post
      .find({})
      .populate('creatorId')
      .exec((err, posts) => {
        if (err) return err;
        console.log(posts);
        res.render('post/listpost', {posts,user:req.user});
      });

  });

router.get('/newpost',(req,res)=>{
  console.log("en post router get");
  console.log(req.user);
  console.log(req.query);
  res.render('post/newpost',{user:req.user});
});

router.post('/newpost',myUploaderPost.single('file'),(req,res)=>{
  console.log("en routerpost newpost");
  console.log(req.body);

  const newPost = new Post({
      content: req.body.content,
      creatorId: req.body.creatorId,
      picPath: `/uploads/${req.file.filename}`,
      picName: req.body.name
    });

  newPost.save((err)=>{
    if (err) {
      console.log(err);
      next(err);
      return;
    }
    res.redirect('/');
  });

});


/* to delete file from publics, fs.unlink of node.js*/
router.post('/:id/delete',function(req,res){

    console.log(req.params.id);
    const id = req.params.id;

    Post.findByIdAndRemove(id, (err, product) => {
      console.log(product);
      console.log(product.picPath);
      var picToDelete='public'+product.picPath;
      console.log(picToDelete);
      if (err){
        console.log(err);
        return next(err);
      } else {
        console.log("borrado BBDD, vamos a borrar el fichero");
        fs.unlink(picToDelete, (err) => {
          try{
            if (err) throw err;
            console.log('successfully deleted file: '+picToDelete);
          }
          catch (err){
            console.log(err);
            console.log("No se encuentra este fichero: "+picToDelete);
          }
          finally {
            console.log("he pasado por el unlink");
          }
        });
      }

      return res.redirect('/');
    });

});


//el objeto de esta ruta es obtener el nombre del creador de un post
// a trave de su id que esta almacenado en el post.
router.get('/:id/creatorname',(req,res)=>{
  var id=req.params.id;
  console.log(id);
  User.findById({_id:id},(err,user)=>{
    console.log(user.username);
    if (err) next(err);
    return user;
  });
});

module.exports = router;
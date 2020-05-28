/* eslint-disable camelcase */
const mariadb = require('mariadb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '/./../../.env') });

// Creates a connection to mariadb server
const pool = mariadb.createPool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
});

// creates a new connection object to ensure mariadb is connected
pool.getConnection()
  .then((connection) => {
    console.log(`connected to db guys! connection id is:${connection.threadId} 🌲`);
    connection.release();
  })
  .catch((error) => {
    console.log(`not connected due to error: ${error}`);
  });


// USERS QUERIES //

// Gets all users
const getAllUsers = () => pool.query('select * from users');

// Adds new user
const createUser = (req) => {
  const {
    username, name_first, name_last, id, image_url,
  } = req.body;
  return pool.query(`insert into users set id = ${id}, image_url = '${image_url}', username = '${username}', name_first = '${name_first}', name_last = '${name_last}', total_like = ${0}`);
};

// Gets user by id
const getUsersById = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`SELECT * FROM users WHERE id = ${id}`);
};

// Get seed count (all likes for a user)
const getSeedCount = (req) => {
  const { id } = req.params;
  return pool.query(`select total_like from users where id = '${id}'`);
};


// POSTS QUERIES //

// Gets all posts
const getAllPosts = () => pool.query('select * from posts');

// Get post by id
const getPostById = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`SELECT * FROM posts WHERE id = ${id}`);
};

// Gets all posts by user from user id
const getUserPosts = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`select * from posts where user_id = ${id} order by created_at desc `);
};

// Adds new post
const addPost = (req) => {
  const {
    text, url, user_id, tag,
  } = req.body;
  return pool.query(`INSERT INTO posts set user_id = '${user_id}', like_count = ${0}, url = '${url}', text = '${text}', created_at = NOW(), tag = '${tag}'`)
    .then(() => pool.query(`insert into tags set text = '${text}'`));
};


// LIKES QUERIES //

// add to likes count on post
const likePost = (req) => {
  const { id, user_id } = req.body;
  return pool.query(`select * from likes where post_id = ${id} and user_id = '${user_id}'`)
    .then((likesResult) => {
      if (likesResult.length) {
        pool.query(`delete from likes where post_id = ${id} and user_id = '${user_id}'`)
          .then(() => pool.query(`UPDATE posts set like_count = like_count - 1 WHERE id = ${id}`))
          .then(() => pool.query(`select user_id from posts where id = ${id}`))
          .then((result) => pool.query(`update users set total_like = total_like - 1 where id = '${result[0].user_id}'`));
      } else {
        pool.query(`insert into likes set post_id = ${id}, user_id = '${user_id}'`)
          .then(() => pool.query(`UPDATE posts set like_count = like_count + 1 WHERE id = ${id}`))
          .then(() => pool.query(`select user_id from posts where id = ${id}`))
          .then((result) => pool.query(`update users set total_like = total_like + 1 where id = '${result[0].user_id}'`));
      }
    });
};

// Gets all postIds from likes
const getAllLikedPosts = (req) => {
  const { id } = req.params;
  return pool.query(`select post_id from likes where user_id = '${id}'`);
};


// COMMENTS QUERIES //

// Gets all comments
const getAllComments = () => pool.query('select * from comments');

// Gets all comments of a post by post id
const getCommentsFromPostId = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`select * from comments where post_id = ${id} order by created_at desc `);
};

// Gets all comments of a user by user id
const getCommentsFromUserId = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`select * from comments where user_id = ${id} order by created_at desc `);
};

// Add new comment to database
const addComment = (req) => {
  const { comment_text, user_id, post_id } = req.body;
  return pool.query(`insert into comments set user_id = '${user_id}', post_id = ${post_id}, comment_text = '${comment_text}', created_at = NOW()`);
};

// Delete comment from post
const deleteComment = (req) => {
  const { id, user_id } = req.body;
  return pool.query(`delete from comments where user_id = '${user_id}' and id = ${id}`);
};


// MESSAGES QUERIES //

// Gets all users
const getAllMessages = () => pool.query('select * from messages');

// Gets all messages for user recipient by recipient id
const getRecipientMessages = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`select * from messages where recipient_id = ${id} order by created_at desc `);
};

// Gets all messages sent by user from user id
const getSentUserMessages = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`select * from messages where user_id = ${id} order by created_at desc `);
};

// Add new message to database
const addMessage = (req) => {
  const { text, recipient_id, user_id } = req.body;
  return pool.query(`insert into messages set user_id = ${user_id}, recipient_id = ${recipient_id}, created_at = NOW(), text = '${text}'`);
};


// FOLLOWERS QUERIES //

// Get all followers_id from user_id
const getFollowersById = (req) => {
  const { id } = req.params;
  return pool.query(`select * from followers where user_id = '${id}'`)
    .then((followers) => Promise.all(followers.map((follower) => pool.query(`select * from users where id = '${follower.follower_id}'`))));
};

// Get all following by id
const getFollowingById = (req) => {
  const { id } = req.params;
  return pool.query(`select * from followers where follower_id = '${id}'`)
    .then((followers) => Promise.all(followers.map((follower) => pool.query(`select * from users where id = '${follower.user_id}'`))));
};

// Follow new user
const followNewUser = (req) => {
  const { user_id, follower_id } = req.body;
  return pool.query(`insert into followers set user_id = '${user_id}', follower_id = '${follower_id}'`);
};

// Un-follow a user
const unFollowUser = (req) => {
  const { user_id, follower_id } = req.body;
  return pool.query(`delete from followers where user_id = '${user_id}' and follower_id = '${follower_id}'`);
};


// TAGS QUERIES //

// Gets all tags
const getAllTags = () => pool.query('select * from tags');

// Add new tag to database
const addTag = (req) => {
  const { text } = req.body;
  return pool.query(`insert into tags set text = '${text}'`);
};


// POST_TAGS QUERIES //

// Get all post_ids from tag_id
const getPostsFromTagId = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`select * from post_tags where tag_id = ${id} order by created_at desc `);
};

// Get all tag_ids from post_id
const getTagsFromPostId = (req) => {
  const id = parseInt(req.params.id, 10);
  return pool.query(`select * from post_tags where post_id = ${id} order by created_at desc `);
};

const getUserMessages = (req) => {
  const { id } = req.params;
  const user_id = parseInt(id, 10);

  return pool.query(`select text, created_at, recipient_id from messages where user_id = ${user_id} order by created_at desc`);
};


module.exports = {
  getAllUsers,
  getUsersById,
  createUser,
  getAllPosts,
  getUserPosts,
  getPostById,
  addPost,
  getAllComments,
  getCommentsFromPostId,
  getCommentsFromUserId,
  addComment,
  getAllMessages,
  getRecipientMessages,
  getSentUserMessages,
  addMessage,
  getFollowersById,
  getAllTags,
  addTag,
  getPostsFromTagId,
  getTagsFromPostId,
  getUserMessages,
  likePost,
  followNewUser,
  unFollowUser,
  deleteComment,
  getFollowingById,
  getAllLikedPosts,
  getSeedCount,
};

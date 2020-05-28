import { combineReducers } from 'redux';
import seedsReducer from './slices/seeds';
import plantsReducer from './slices/plants';
import usersReducer from './slices/users';
import postsReducer from './slices/posts';
import messagesReducer from './slices/messages';
import authReducer from './slices/auth';
import photoReducer from './slices/photo';
import followReducer from './slices/follow';
import commentsReducer from './slices/comments';

// Future reducers can be imported above like plantsReducer
// then added as a key value to the combineReducers
// combineReducers is then passed into the creation of the store in configureStore
export default combineReducers({
  auth: authReducer,
  seeds: seedsReducer,
  follow: followReducer,
  messages: messagesReducer,
  photo: photoReducer,
  plants: plantsReducer,
  posts: postsReducer,
  users: usersReducer,
  comments: commentsReducer,
});

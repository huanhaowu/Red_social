import {useEffect, useState} from 'react';
import {supabase} from '../../supabase/client.js';
import {Link, useNavigate} from 'react-router-dom';
import {getUserIDbyEmail} from '../../functions/User/getUserIDbyEmail.js';
import {getRelationByUserIDandFollowedID} from '../../functions/Relation/getRelationByUserIDandFollowedID.js';
import {postFollowUser} from '../../functions/Relation/postFollowUser.js';
import {postUnfollowUser} from '../../functions/Relation/postUnfollowUser.js';

const Findusers = ({token}) => {

    const navigate = useNavigate()

    function handleLogout(){
        sessionStorage.removeItem('token');
        navigate('/');
    }

    function handleHomePage(){
        navigate('/homepage');
    }

  //this is a test
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Implement a debounce function to delay the API request
    const fetchCurrentUser = async () => {
      try {
        const user = await getUserIDbyEmail(token.user.email);
        setCurrentUser(user[0].id);
      } catch (error) {
        console.error('Error fetching current user:', error.message);
      }
    };

    fetchCurrentUser();

    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };

    // Function to fetch search results
    const fetchSearchResults = async (input) => {
      setLoading(true);
      try {
        const { data: users, error } = await supabase
          .from('User')
          .select('*')
          .ilike('Username', `%${input}%`); // Adjust column name as needed

        if (error) {
          throw error;
        }

        const filteredUsers = users.filter((user) => user.id !== currentUser);
        setSearchResults(filteredUsers || []);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching search results:', error.message);
        setLoading(false);
      }
    };

    const debouncedFetch = debounce(fetchSearchResults, 300); // Adjust the delay as needed

    if (inputValue.trim() !== '') {
      debouncedFetch(inputValue);
    } else {
      setSearchResults([]);
    }
  }, [inputValue, currentUser, token.user.email]);
    //end of test

    const handleShowAllUsers = async () => {
      try {
        const { data: allUsers, error } = await supabase
          .from('User')
          .select('*');
  
        if (error) {
          throw error;
        }
        const filteredUsers = allUsers.filter((u) => u.id !== currentUser);
        setSearchResults(filteredUsers || []);
      } catch (error) {
        console.error('Error fetching all users:', error.message);
      }
    };

    async function handleFollow(UserID){
      // console.log( 'The user ' + user[0].id + ' started to follow ' + UserID);
      const hasLiked = await getRelationByUserIDandFollowedID(currentUser, UserID);

      if (hasLiked === false) {
          // Call the postLikeByPostID function
          await postFollowUser(currentUser, UserID);
      } else {
          // Call the deleteLikeByPostID function
          await postUnfollowUser(currentUser, UserID);
      }
  }

  return (
    <>
        <h1>Find users</h1>
        <div>
          <input
            type="text"
            placeholder="Search users by username"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button onClick={handleShowAllUsers}>Show All Users</button>
          {loading && <div>Loading...</div>}
          {searchResults.length === 0 && !loading && (
            <p>No records found.</p>
          )}
          {searchResults.length > 0 && (
            <ul>
              {searchResults.map((user) => (
                <li key={user.id}>{user.Username}
                  <button className='ml-2'onClick={() => handleFollow(user.id)}>
                    Follow user
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={handleHomePage}>Homepage</button>
        <button onClick={handleLogout}>Log out</button>
    </>
  );
  
}

export default Findusers
import {useState} from 'react';
import {supabase} from '../supabase/client.js';
import {Link, useNavigate} from 'react-router-dom'

const Login = ({setToken}) => {

    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Email: '', Password: ''
  });

  console.log(formData)

  const handleChange = (e) => {
    setFormData((prevFormData) => {
      return {
        ...prevFormData, 
        [e.target.name]: e.target.value
      }
    })
  }

  async function handleSubmit(e){
    e.preventDefault()

    try {
      // CHECK THIS PART
      const { data: userExistsData, error: userExistsError } = await supabase
      .from('User') // Replace 'users' with your actual table name
      .select('id')
      .eq('Email', formData.Email)

      if (userExistsError) {
        throw new Error('An error occurred while checking for user existence');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.Email,
        password: formData.Password,
      })

      if (error) {
        throw error;
      }

      console.log(data)
      setToken(data)
      navigate('./homepage');
    } catch (error) {
      alert(error);
    }
  }

  return (
    <div> 
      <form onSubmit={handleSubmit}>
        <input placeholder='Email' name='Email' onChange={handleChange}/>
        <input placeholder='Password' name='Password' type='password' onChange={handleChange}/>
        <button type='submit'> Submit </button>
      </form>
      Don't have an account? <Link to={'/signup'}>Sign Up</Link>
    </div>
  )
}

export default Login
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { signup } from '../service/auth.service.js';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            navigate('/');
        }
    })


    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await signup(email, password);
            if(response.success) {
                navigate('/login', { replace: true });
            }
        } catch (err) {
            const message = err?.response?.data?.error || "Error while signing up. Please try again.";
            console.log(err?.response?.data?.error)
            setError(message);
            console.log(err);
        }
    }

    return (
        <main className="flex h-screen items-center justify-center w-full px-4">
            <form className="flex w-full flex-col max-w-96">
        
                <h2 className="text-4xl font-medium text-gray-900">Sign up</h2>
        
                <p className="mt-4 text-base text-gray-500/90">
                    Please enter email and password to access.
                </p>
        
                <div className="mt-10">
                    <label className="font-medium">Email</label>
                    <input
                        placeholder="Please enter your email"
                        className="mt-2 rounded-md ring ring-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none px-3 py-3 w-full"
                        required
                        type="email"
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
        
                <div className="mt-6">
                    <label className="font-medium">Password</label>
                    <input
                        placeholder="Please enter your password"
                        className="mt-2 rounded-md ring ring-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none px-3 py-3 w-full"
                        required
                        type="password"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error != null ? 
                <p className="text-base text-red-500/90">
                    {error}
                </p> : <></>}
        
                <button
                    type="submit"
                    className="mt-8 py-3 w-full cursor-pointer rounded-md bg-indigo-600 text-white transition hover:bg-indigo-700"
                    onClick={(e) => handleSignup(e)}
                >
                    Login
                </button>
                <p className='text-center py-8'>
                    Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
                </p>
            </form>
        </main>
    );
};
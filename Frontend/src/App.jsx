import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from './features/userSlicer';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Loader from './components/Loader';

import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';

function App() {
    const dispatch = useDispatch();
    const { authLoading } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    if (authLoading) return <Loader />;

    return (
        <>
            <Toaster reverseOrder={false} position="top-right" />
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />

                    {/* GuestRoute → only accessible when NOT logged in */}
                    <Route path="/signin" element={<GuestRoute><Signin /></GuestRoute>} />
                    <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

                    {/* Reset password is accessible by anyone */}
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
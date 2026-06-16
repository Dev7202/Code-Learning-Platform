import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from './features/userSlicer';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Loader from './components/Loader';
import Home from './pages/Home';

function App() {

    const dispatch = useDispatch();
    const { authLoading } = useSelector(state => state.user);

    // Check if user is logged in when app first loads
    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);
    

    // Show loader while checking auth
    if (authLoading) return <Loader />;

    return (
        <>
            <Toaster reverseOrder={false} position="top-right" />
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    
                </Routes>
            </Router>
        </>
    );
}

export default App;
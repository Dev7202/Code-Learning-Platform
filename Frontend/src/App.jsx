import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { checkAuth } from './features/userSlicer';
import { fetchUserRoadmaps } from './features/roadmapSlicer';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Loader from './components/Loader';

import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Roadmaps from './pages/Roadmaps';
import Generator from './pages/Generator';
import RoadmapDisplay from './pages/RoadmapDisplay';

function App() {
    const dispatch = useDispatch();
    const { authLoading, isLoggedin } = useSelector(state => state.user);
    const [forceShow, setForceShow] = useState(false);

    useEffect(() => {
        const load = async () => {
            await dispatch(checkAuth());
        };
        load();
        const timer = setTimeout(() => setForceShow(true), 3000);
        return () => clearTimeout(timer);
    }, [dispatch]);

    useEffect(() => {
        if (isLoggedin) dispatch(fetchUserRoadmaps());
    }, [isLoggedin]);

    if (authLoading && !forceShow) return <Loader />;

    return (
        <>
            <Toaster reverseOrder={false} position="top-right" />
            <Router>
                <Routes>
                    <Route path="/"               element={<Home />} />
                    <Route path="/signin"          element={<GuestRoute><Signin /></GuestRoute>} />
                    <Route path="/signup"          element={<GuestRoute><Signup /></GuestRoute>} />
                    <Route path="/reset-password"  element={<ResetPassword />} />
                    <Route path="/roadmaps"        element={<ProtectedRoute><Roadmaps /></ProtectedRoute>} />
                    <Route path="/roadmap/generate" element={<ProtectedRoute><Generator /></ProtectedRoute>} />
                    <Route path="/roadmap/:id"     element={<ProtectedRoute><RoadmapDisplay /></ProtectedRoute>} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
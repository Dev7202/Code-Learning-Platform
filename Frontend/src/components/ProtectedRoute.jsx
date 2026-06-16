import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
    const { isLoggedin, authLoading } = useSelector(state => state.user);

    if (authLoading) return <Loader />;
    return isLoggedin ? children : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
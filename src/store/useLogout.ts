import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './hooks';
import { clearProfile } from './authSlice';
import { persistor } from './store';

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    dispatch(clearProfile());
    await persistor.purge();
    navigate('/login', { replace: true });
  };

  return { logout };
}

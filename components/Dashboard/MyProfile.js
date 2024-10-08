import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import styles from '../../styles/Dashboard.module.css';
import { logout } from '../../reducers/user';
import { deleteSearches } from '../../reducers/search';

function MyProfile(){
    //Reducer
    const dispatch = useDispatch()

    // Page Redirection 
    const router = useRouter();

    const handleRedirect = () => {
        router.push('/user-information')
    }

    const handleDisconnect = () => {
        dispatch(logout())
        dispatch(deleteSearches())
        router.push('/')
    }
    
    return(
        <div className={styles.myProfileContainer}>
            <h2 className={styles.titleMyInfo}>Mon Profil</h2>
            <div className={styles.btnParams}>
                <button onClick={()=>handleRedirect()}>Mes informations</button>
                <button onClick={() => handleDisconnect()}>Déconnexion</button>
            </div>
     </div>
)
}
export default MyProfile;
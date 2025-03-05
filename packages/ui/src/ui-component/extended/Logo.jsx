import logo from '@/assets/images/virtuosoconductor_logo.png'
import logoDark from '@/assets/images/virtuosoconductor_logo_dark.png'

import { useSelector } from 'react-redux'

// ==============================|| LOGO ||============================== //

const Logo = () => {
    const customization = useSelector((state) => state.customization)

    return (
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
            <img
                style={{ objectFit: 'contain', height: 'auto', width: 100 }}
                src={customization.isDarkMode ? logoDark : logo}
                alt='Virtuoso Conductor'
            />
        </div>
    )
}

export default Logo

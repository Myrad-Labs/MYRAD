import React, { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

interface PrivyProviderWrapperProps {
    children: ReactNode;
}

const PrivyProviderWrapper: React.FC<PrivyProviderWrapperProps> = ({ children }) => {
    const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

    if (!privyAppId) {
        console.error('VITE_PRIVY_APP_ID is not set in environment variables');
        return <div>Error: Privy App ID not configured</div>;
    }

    return (
        <PrivyProvider
            appId={privyAppId}
            config={{
                loginMethods: ['email', 'google', 'twitter', 'wallet'],
                appearance: {
                    theme: 'light',
                    accentColor: '#333333', // Dark grey to match white/grey/black theme
                    logo: '/logo.png'
                },
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets'
                    }
                }
            }}
        >
            {children}
        </PrivyProvider>
    );
};

export default PrivyProviderWrapper;

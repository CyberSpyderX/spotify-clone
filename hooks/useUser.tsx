import { User as SupabaseUserType } from "@supabase/auth-helpers-nextjs";
import { 
    useSessionContext,
    useUser as useSupabaseUser
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from 'react';

import { Subscription, UserDetails } from '@/types';

type UserContextType = {
    accessToken: string | null;
    user: SupabaseUserType | null;
    userDetails: UserDetails | null;
    isLoading: boolean;
    subscription: Subscription | null;
}

export const UserContext = createContext<UserContextType | undefined> ( undefined );

export interface Props {
    [propName: string]: any;
}

export const MyUserContextProvider = ( props: Props ) => {
    const {
        session,
        isLoading: isLoadingUser,
        supabaseClient: supabase
    } = useSessionContext();

    const user = useSupabaseUser();
    const accessToken = session?.access_token || null;
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    const getUserDetails = () => supabase.from('user').select('*').single();
    const getSubscription = () => 
        supabase
            .from('subscription')
            .select('*, prices(*, product(*))')
            .in('status', ['trialing, active'])
            .single(); // TODO: Understand the nested query
    
    useEffect(() => {
        if(user && !isLoadingData && !userDetails && !subscription) {
            setIsLoadingData(true);

            Promise.allSettled( [getUserDetails(), getSubscription() ] ).then(
                (results) => {
                    const userDetailPromise = results[0];
                    const subscriptionPromise = results[1];

                    if(userDetailPromise.status === 'fulfilled') {
                        setUserDetails(userDetailPromise.value.data);
                    }
                    
                    if(subscriptionPromise.status === 'fulfilled') {
                        setUserDetails(subscriptionPromise.value.data);
                    }
                }
            )

            setIsLoadingData(false);
        }
        else if ( !user && !isLoadingData && !isLoadingUser) {
            setUserDetails(null);
            setSubscription(null);
         }
    }, [user, isLoadingUser]);
    
    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingUser || isLoadingData,
        subscription
    };

    return <UserContext.Provider value={value} {...props} ></UserContext.Provider>
}

export const useUser = () => {
    const context = useContext(UserContext);

    if(context === undefined) {
        throw new Error();
    }

    return context;
}

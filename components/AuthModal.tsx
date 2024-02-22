import { Auth } from "@supabase/auth-ui-react";
import Modal from "./Modal";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthModal = () => {
    
    const router = useRouter();
    const supabaseClient = useSupabaseClient();
    const { session } = useSessionContext();
    const { isOpen, onClose } = useAuthModal();
    const onChange = (open: boolean) => {
        if(!open) {
            onClose();
        }
    }

    useEffect(() => {
        if(session) {
            router.refresh();
            onClose();
        }
    }, [session, router, onClose]);

    return (
        <Modal
            title="Welcome Back"
            description="Login to your account"
            isOpen={isOpen}
            onChange={onChange}
        >
            <Auth
                theme="dark"
                magicLink
                providers={["github"]}
                supabaseClient={supabaseClient}
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: '#404040',
                                brandAccent: '#22c55e',
                            }
                        }
                    }
                }}
            />
        </Modal>
    )
}

export default AuthModal;
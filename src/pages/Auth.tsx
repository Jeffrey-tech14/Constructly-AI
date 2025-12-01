import { useState, useEffect } from "react";

import { useSearchParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";

import {

    ArrowLeft,

    Loader2,

    EyeOff,

    Eye,

    Check,

    // REMOVED: Chrome, // <-- ADDED: Chrome icon for Google

} from "lucide-react";

// ADDED: Import FcGoogle from react-icons/fc

import { FcGoogle } from "react-icons/fc";

import { useAuth } from "@/contexts/AuthContext";

import { ThemeToggle } from "@/components/ThemeToggle";

import { toast } from "@/hooks/use-toast";

import { motion } from "framer-motion";



// CUSTOM COLOR PALETTE (Matching the reference image)

const CUSTOM_YELLOW = "#D4AF37"; // Rich Gold/Yellow for main button

const CUSTOM_BLUE = "#015B97";

const TEXT_WHITE = "#ffffff";

const TEXT_DARK = "#2D3748";

const TEXT_GRAY_MEDIUM = "#9CA3AF"; // Tailwind gray-400 equivalent



const Auth = () => {

    const [searchParams] = useSearchParams();

    const [mode, setMode] = useState(searchParams.get("mode") || "signin");

    const [formData, setFormData] = useState({

        email: "",

        password: "",

        confirmPassword: "",

        name: "",

    });

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");



    const { user, profile, signIn, signUp, signInWithGoogle } = useAuth();



    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        setLoading(true);



        try {

            if (mode === "signup") {

                if (formData.password !== formData.confirmPassword) {

                    throw new Error("Passwords do not match");

                }

                if (formData.password.length < 6) {

                    throw new Error("Password must be at least 6 characters");

                }



                await signUp(formData.email, formData.password, formData.name);

                setSuccess(

                    "Account created successfully! Please check your email to verify your account."

                );

            }



            if (mode === "signin") {

                await signIn(formData.email, formData.password);

            }

        } catch (err: any) {

            let friendlyMessage = "Something went wrong. Please try again.";

            const msg = err.message.toLowerCase();



            if (msg.includes("passwords do not match")) {

                friendlyMessage = "Your passwords do not match.";

            } else if (msg.includes("at least 6 characters")) {

                friendlyMessage = "Password must be at least 6 characters long.";

            } else if (

                msg.includes("invalid login") ||

                msg.includes("invalid credentials")

            ) {

                friendlyMessage = "Invalid email or password. Please try again.";

            } else if (msg.includes("user not found")) {

                friendlyMessage = "No account found with that email.";

            } else if (msg.includes("email already in use")) {

                friendlyMessage = "This email is already registered. Try signing in.";

            } else if (msg.includes("network")) {

                friendlyMessage =

                    "Network error. Please check your internet connection.";

            }



            toast({

                title: "Authentication Error",

                description: friendlyMessage,

                variant: "destructive",

            });



            setError(friendlyMessage);

        } finally {

            setLoading(false);

        }

    };

   

    // NEW: Google Sign-In Handler

    const handleGoogleSignIn = async () => {

        try {

            setLoading(true);

            await signInWithGoogle();

        } catch(err: any) {

            toast({ title: "Google Sign-In Error", description: err.message, variant: "destructive" });

        } finally {

            setLoading(false);

        }

    }





    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setFormData((prev) => ({

            ...prev,

            [e.target.name]: e.target.value,

        }));

    };



    if (user) {

        navigate("/dashboard");

    }



    return (

        // 1. Full-Screen Container with Background Image

        <div

            className="min-h-screen flex items-center justify-center p-4 bg-gray-900"

            style={{

                // **IMPORTANT: Replace this path** with the correct relative path to your image

                // (e.g., from your public folder: '/image_5b15b5.png')

                backgroundImage: `url('/image_5b15b5.png')`,

                backgroundSize: "cover",

                backgroundPosition: "center",

                backgroundRepeat: "no-repeat",

                position: "relative",

            }}

        >

            {/* 2. Semi-Transparent Dark Overlay (Subtle) */}

            <div className="absolute inset-0 bg-black/50"></div>

           

            {/* Floating Theme Toggle (ensure it's above the overlay) */}

            <div className="fixed top-4 right-4 z-50">

                <ThemeToggle />

            </div>



            {/* 3. Main Content Container (Centered & using grid for split layout) */}

            <motion.div

                className="relative z-10 w-full max-w-5xl py-12 px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center justify-center min-h-[500px]"

                initial={{ opacity: 0, y: 30 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.8, ease: "easeOut" }}

            >

                {/* --- LEFT SECTION: WELCOME & MARKETING --- */}

                <motion.div

                    className="flex flex-col text-white text-left"

                    initial={{ opacity: 0, x: -30 }}

                    animate={{ opacity: 1, x: 0 }}

                    transition={{ delay: 0.5 }}

                >

                    <h1 className="text-6xl font-extrabold mb-2 leading-tight">

                        Welcome

                    </h1>

                    <h2 className="text-6xl font-extrabold mb-4 leading-tight">

                        Back  

                    </h2>

                    <p className="text-base text-gray-300 max-w-md">

                        Sign in to your accout an start generating accurate quotes in minutes

                  

                    </p>

                </motion.div>



                {/* --- RIGHT SECTION: SIGN IN FORM --- */}

                <motion.div

                    className="w-full max-w-sm lg:max-w-md space-y-6"

                    initial={{ opacity: 0, x: 30 }}

                    animate={{ opacity: 1, x: 0 }}

                    transition={{ delay: 0.7 }}

                >

                    {/* Sign In Header (Correctly positioned on the right) */}

                    <h3 className="text-4xl font-semibold text-white mb-2">

                        {mode === 'signin' ? "Sign in" : "Create Account"}

                    </h3>



                    {/* Error/Success Alerts */}

                    {error && (

                        <motion.div

                            initial={{ opacity: 0, y: -10 }}

                            animate={{ opacity: 1, y: 0 }}

                        >

                            <Alert className="border-red-500 bg-red-900/40 border-l-4">

                                <AlertDescription className="text-red-300">

                                    {error}

                                </AlertDescription>

                            </Alert>

                        </motion.div>

                    )}

                    {success && (

                        <motion.div

                            initial={{ opacity: 0, y: -10 }}

                            animate={{ opacity: 1, y: 0 }}

                        >

                            <Alert className="border-green-500 bg-green-900/40 border-l-4">

                                <AlertDescription className="text-green-300">

                                    <Check className="w-4 h-4 inline mr-2" />

                                    {success}

                                </AlertDescription>

                            </Alert>

                        </motion.div>

                    )}



                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Name Input (Signup) */}

                        {mode === "signup" && (

                            <div className="space-y-2">

                                <Label htmlFor="name" className="text-sm font-medium text-gray-400 block">

                                    Full Name

                                </Label>

                                <Input

                                    id="name"

                                    name="name"

                                    type="text"

                                    value={formData.name}

                                    onChange={handleInputChange}

                                    required

                                    placeholder="Your Name"

                                    className="auth-input-white"

                                />

                            </div>

                        )}

                       

                        {/* Email Input */}

                        <div className="space-y-2">

                            <Label htmlFor="email" className="text-sm font-medium text-gray-400 block">

                                Email Address

                            </Label>

                            <Input

                                id="email"

                                name="email"

                                type="email"

                                value={formData.email}

                                onChange={handleInputChange}

                                required

                                placeholder="email@example.com"

                                className="auth-input-white"

                            />

                        </div>



                        {/* Password Input */}

                        <div className="space-y-2">

                            <Label htmlFor="password" className="text-sm font-medium text-gray-400 block">

                                Password

                            </Label>

                            <div className="relative">

                                <Input

                                    id="password"

                                    name="password"

                                    type={showPassword ? "text" : "password"}

                                    value={formData.password}

                                    onChange={handleInputChange}

                                    required

                                    placeholder="••••••••"

                                    className="auth-input-white pr-10"

                                />

                                <button

                                    type="button"

                                    onClick={() => setShowPassword((prev) => !prev)}

                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"

                                    tabIndex={-1}

                                >

                                    {showPassword ? (

                                        <EyeOff className="w-4 h-4" />

                                    ) : (

                                        <Eye className="w-4 h-4" />

                                    )}

                                </button>

                            </div>

                        </div>



                        {/* Confirm Password (Signup) */}

                        {mode === "signup" && (

                            <div className="space-y-2">

                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-400 block">

                                    Confirm Password

                                </Label>

                                <div className="relative">

                                    <Input

                                        id="confirmPassword"

                                        name="confirmPassword"

                                        type={showPassword ? "text" : "password"}

                                        value={formData.confirmPassword}

                                        onChange={handleInputChange}

                                        required

                                        placeholder="••••••••"

                                        className="auth-input-white pr-10"

                                    />

                                    <button

                                        type="button"

                                        onClick={() => setShowPassword((prev) => !prev)}

                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"

                                        tabIndex={-1}

                                    >

                                        {showPassword ? (

                                            <EyeOff className="w-4 h-4" />

                                        ) : (

                                            <Eye className="w-4 h-4" />

                                        )}

                                    </button>

                                </div>

                            </div>

                        )}





                        {/* Remember Me / Primary Button Container */}

                        <div className={`flex items-center ${mode === "signin" ? 'justify-between' : 'justify-end'} pt-2`}>

                            {mode === "signin" && (

                                <div className="flex items-center space-x-2">

                                    <input

                                        type="checkbox"

                                        id="rememberMe"

                                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500"

                                    />

                                    <label htmlFor="rememberMe" className="text-white text-sm">

                                        Remember Me

                                    </label>

                                </div>

                            )}

                        </div>



                        {/* Sign In / Create Account Button */}

                        <motion.button

                            whileHover={{ scale: 1.02 }}

                            whileTap={{ scale: 0.98 }}

                            type="submit"

                            className="w-full text-lg font-semibold py-3 px-6 rounded-md shadow-lg transition-all duration-300 risa-btn-yellow"

                            disabled={loading}

                            style={{marginTop: '1.5rem'}}

                        >

                            {loading && (

                                <Loader2 className="w-4 h-4 mr-2 animate-spin inline text-black" />

                            )}

                            {mode === "signin" ? "Sign in now" : "Create Account"}

                        </motion.button>

                       

                       

                        {/* --- NEW: CONTINUE WITH GOOGLE SECTION --- */}

                        <div className="flex items-center justify-center py-2">

                            <div className="h-px w-full bg-gray-700"></div>

                            <span className="text-gray-400 text-xs px-2 uppercase tracking-widest">or</span>

                            <div className="h-px w-full bg-gray-700"></div>

                        </div>



                        <motion.button

                            whileHover={{ scale: 1.02, backgroundColor: '#222' }}

                            whileTap={{ scale: 0.98 }}

                            type="button"

                            onClick={handleGoogleSignIn} // <-- CALL HANDLER

                            className="w-full text-base font-semibold py-3 px-6 rounded-md border border-gray-600 bg-gray-800 text-white transition-all duration-300 flex items-center justify-center space-x-3"

                            disabled={loading}

                        >

                            {/* REPLACED: Chrome with FcGoogle */}

                            <FcGoogle className="w-5 h-5" />

                            <span>Continue with Google</span>

                        </motion.button>

                        {/* --- END NEW SECTION --- */}





                        {/* Lost Password */}

                        {mode === "signin" && (

                            <div className="text-center pt-2">

                                <motion.button

                                    type="button"

                                    className="text-gray-400 text-sm hover:text-white transition-colors"

                                    whileHover={{ scale: 1.03 }}

                                >

                                    Lost your password?

                                </motion.button>

                            </div>

                        )}

                       

                        {/* Terms and Policy & Mode Toggle */}

                        <div className="text-center pt-2">

                            <p className="text-xs text-gray-400 mb-2">

                                By signing in you agree to

                                <a href="#" className="text-gray-300 hover:text-white transition-colors mx-1">

                                    Jtech Ai policies

                                </a> and terms of use.

                            </p>

                           

                            <p className="text-gray-400 text-sm">

                                {mode === "signin"

                                    ? "Don't have an account? "

                                    : "Already have an account? "}

                                <motion.button

                                    whileHover={{ color: CUSTOM_YELLOW }}

                                    whileTap={{ scale: 0.95 }}

                                    onClick={() =>

                                        setMode(mode === "signin" ? "signup" : "signin")

                                    }

                                    className="text-sm font-semibold transition-colors"

                                    style={{

                                        color: TEXT_WHITE,

                                        backgroundColor: "transparent",

                                        border: "none",

                                        cursor: "pointer",

                                    }}

                                    disabled={loading}

                                >

                                    {mode === "signin" ? "Sign up" : "Sign in"}

                                </motion.button>

                            </p>

                        </div>



                    </form>

                </motion.div>

            </motion.div>



            {/* Global Styles for input and buttons */}

            <style>{`

                /* White input fields on dark background */

                .auth-input-white {

                    background-color: ${TEXT_WHITE} !important;

                    color: ${TEXT_DARK} !important;

                    border-radius: 4px !important;

                    border: none !important;

                    height: 3.5rem !important;

                    padding: 0.5rem 1rem !important;

                    font-size: 1rem !important;

                    box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;

                    transition: all 0.3s ease;

                }

                .auth-input-white:focus {

                    box-shadow: 0 0 0 2px ${CUSTOM_YELLOW} !important;

                    outline: none;

                }



                /* Yellow button for primary action */

                .risa-btn-yellow {

                    background-color: ${CUSTOM_YELLOW};

                    color: ${TEXT_DARK};

                    font-weight: 700;

                    border-radius: 4px;

                    transition: all 0.3s ease;

                }

                .risa-btn-yellow:hover {

                    background-color: #E6C34C;

                }

                .risa-btn-yellow:disabled {

                    opacity: 0.7;

                    cursor: not-allowed;

                }

            `}</style>

        </div>

    );

};



export default Auth;
import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
return (
  <div className="min-h-screen bg-black text-white flex items-center justify-center" style={{ perspective: '1500px' }}>
     <div className="relative w-[400px] h-[300px]" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg) rotateY(35deg) rotateZ(-10deg)' }}>
        <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800" className="absolute w-full h-full object-cover rounded-xl shadow-2xl opacity-50 transform translate-z-[-100px] -translate-x-10 translate-y-10" />
        <img src="https://images.unsplash.com/photo-1664303352726-2581ad394ba0?auto=format&fit=crop&q=80&w=800" className="absolute w-full h-full object-cover rounded-xl shadow-2xl opacity-80" />
        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" className="absolute w-full h-full object-cover rounded-xl shadow-2xl transform translate-z-[100px] translate-x-10 -translate-y-10" />
     </div>
  </div>
);
};
export default Hero;

import React from 'react';
import { motion } from "framer-motion";
import { Sparkles } from 'lucide-react';

const testimonials = [
  {
    text: "JPTL revolutionized our multi-unit operations, streamlining rent tracking and repair tickets. The PWA keeps our team responsive everywhere.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Briana Patton",
    role: "Property Operations Manager",
  },
  {
    text: "Implementing JPTL was smooth and quick. The role-scoped interface made onboarding our landlords and tenants effortless.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Bilal Ahmed",
    role: "IT & Systems Lead",
  },
  {
    text: "The synchronous status cascade and push notification engine mean tenants get immediate repair updates without any lost emails.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Saman Malik",
    role: "Tenant Support Director",
  },
  {
    text: "This platform's EventEmitter payment simulation enhanced our checkout efficiency. Highly recommend for multi-tenant buildings.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Omar Raza",
    role: "CEO at Horizon Living",
  },
  {
    text: "Its robust audit trail logging and instant status cascades transformed our maintenance workflow, saving us hours every week.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Zainab Hussain",
    role: "Senior Asset Manager",
  },
  {
    text: "The smooth implementation exceeded expectations. It streamlined tenant leases, improving overall occupancy performance.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Aliza Khan",
    role: "Real Estate Analyst",
  },
  {
    text: "Submitting a repair request takes seconds on mobile. Seeing live status updates as the landlord fixes it is incredible.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Farhan Siddiqui",
    role: "Resident at Aura Towers",
  },
  {
    text: "Superadmin oversight gives us unscoped read-only visibility into all properties, logs, and account statuses across the region.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sana Sheikh",
    role: "Platform Administrator",
  },
  {
    text: "Using JPTL's property portfolio console, our unit occupancy and maintenance response times significantly improved.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Hassan Ali",
    role: "Portfolio Director",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = ({ className = '', testimonials, duration = 10 }) => {
  return (
    <div className={className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {testimonials.map(({ text, image, name, role }, i) => (
                <motion.li 
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileFocus={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-8 rounded-3xl border border-white/10 shadow-lg shadow-black/30 max-w-xs w-full bg-[#10101A] transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-blue-500/30" 
                >
                  <blockquote className="m-0 p-0">
                    <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm font-normal m-0 transition-colors duration-300">
                      "{text}"
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all duration-300 ease-in-out"
                      />
                      <div className="flex flex-col">
                        <cite className="font-grotesk font-bold not-italic tracking-tight leading-5 text-white text-sm transition-colors duration-300">
                          {name}
                        </cite>
                        <span className="text-xs leading-5 tracking-tight text-slate-400 font-sans mt-0.5 transition-colors duration-300">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export function TestimonialsV2() {
  return (
    <section 
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="bg-[#08080C] py-24 relative overflow-hidden border-t border-white/10 z-10 font-sans"
    >
      <motion.div 
        initial={{ opacity: 0, y: 50, rotate: -1 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 }
        }}
        className="container px-4 z-10 mx-auto"
      >
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16 text-center">
          <div className="flex justify-center">
            <div className="border border-blue-500/20 py-1 px-4 rounded-full text-xs font-mono font-semibold tracking-wide uppercase text-blue-400 bg-blue-500/10 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TESTIMONIALS</span>
            </div>
          </div>

          <h2 id="testimonials-heading" className="font-grotesk text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-white">
            What our users say
          </h2>
          <p className="font-sans text-center mt-3 text-slate-400 text-sm sm:text-base leading-relaxed max-w-md font-normal">
            Discover how property managers, landlords, and tenants streamline their operations with JPTL.
          </p>
        </div>

        <div 
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </motion.div>
    </section>
  );
}

export default TestimonialsV2;

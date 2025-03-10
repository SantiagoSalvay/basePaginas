import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const AnimatedSection = ({ 
  children, 
  className, 
  animation = "fade", 
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  triggerOnce = true
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Animaciones básicas que se activan al entrar en el viewport
  const animations = {
    fade: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: duration,
          delay: delay,
        },
      },
    },
    slideUp: {
      hidden: { opacity: 0, y: 100 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay: delay,
        },
      },
    },
    slideRight: {
      hidden: { opacity: 0, x: -100 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay: delay,
        },
      },
    },
    slideLeft: {
      hidden: { opacity: 0, x: 100 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay: delay,
        },
      },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay: delay,
        },
      },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10, scale: 0.8 },
      visible: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: {
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay: delay,
        },
      },
    },
  };

  // Propiedades transformadas basadas en el scroll
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [100, 0, 0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.8, 1, 1, 0.8]);

  // Determinar si usar animación basada en scroll o basada en viewport
  const isScrollAnimation = animation.startsWith("scroll");
  
  if (isScrollAnimation) {
    // Animaciones basadas en el progreso del scroll
    return (
      <motion.section
        ref={ref}
        className={className}
        style={{ 
          opacity: animation === "scrollFade" || animation === "scrollAll" ? opacity : 1,
          y: animation === "scrollSlide" || animation === "scrollAll" ? y : 0,
          scale: animation === "scrollScale" || animation === "scrollAll" ? scale : 1
        }}
      >
        {children}
      </motion.section>
    );
  }

  // Animaciones basadas en viewport (cuando el elemento entra en la vista)
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: triggerOnce, amount: threshold }}
      variants={animations[animation]}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export default AnimatedSection;

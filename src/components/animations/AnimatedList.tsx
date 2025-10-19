import React, { ReactNode, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import './AnimatedList.css';

interface AnimatedItemProps {
  children: ReactNode;
  index: number;
}

const AnimatedItem = ({ children, index }: AnimatedItemProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ 
        scale: isInView ? 1 : 0.7, 
        opacity: isInView ? 1 : 0 
      }}
      transition={{ 
        duration: 0.2, 
        delay: 0.1 
      }}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  children?: ReactNode;
}

const AnimatedList = ({ children }: AnimatedListProps) => {
  if (!children) return null;

  const childArray = React.Children.toArray(children);
  
  if (childArray.length === 1 && React.isValidElement(childArray[0])) {
    const container = childArray[0];
    
    if (container.props.children) {
      const items = React.Children.toArray(container.props.children);
      
      const animatedItems = items.map((item, index) => (
        <AnimatedItem key={index} index={index}>
          {item}
        </AnimatedItem>
      ));
      
      return React.cloneElement(container, {
        ...container.props,
        children: animatedItems
      });
    }
  }
  
  return (
    <>
      {childArray.map((child, index) => (
        <AnimatedItem key={index} index={index}>
          {child}
        </AnimatedItem>
      ))}
    </>
  );
};

export default AnimatedList;
